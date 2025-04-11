"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface SpeciesSelectorProps {
  species: string[];
  selectedSpecies: string[];
  onSpeciesChange: (species: string[]) => void;
}

export function SpeciesSelector({
  species,
  selectedSpecies,
  onSpeciesChange,
}: SpeciesSelectorProps) {
  const [open, setOpen] = useState(false);

  const formatSpeciesLabel = (label: string) => {
    switch (label) {
      case "BLUE_A":
        return "Blue A Whale";
      case "BLUE_B":
        return "Blue B Whale";
      case "HUMPBACK":
        return "Humpback Whale";
      case "SHIP":
        return "Ship";
      default:
        return label;
    }
  };

  const toggleSpecies = (value: string) => {
    if (selectedSpecies.includes(value)) {
      onSpeciesChange(selectedSpecies.filter((s) => s !== value));
    } else {
      onSpeciesChange([...selectedSpecies, value]);
    }
  };

  const handleSelectAll = () => {
    onSpeciesChange([...species]);
  };

  const handleClearAll = () => {
    onSpeciesChange([]);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Filter by Species
        </label>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="h-8 text-xs"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="h-8 text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedSpecies.length > 0
              ? `${selectedSpecies.length} species selected`
              : "Select species..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search species..." />
            <CommandList>
              <CommandEmpty>No species found.</CommandEmpty>
              <CommandGroup>
                {species.map((speciesItem) => (
                  <CommandItem
                    key={speciesItem}
                    value={speciesItem}
                    onSelect={() => toggleSpecies(speciesItem)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSpecies.includes(speciesItem)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {formatSpeciesLabel(speciesItem)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSpecies.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedSpecies.map((speciesItem) => (
            <Badge
              key={speciesItem}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleSpecies(speciesItem)}
            >
              {formatSpeciesLabel(speciesItem)}
              <span className="ml-1 text-xs">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
