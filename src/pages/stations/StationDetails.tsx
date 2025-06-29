import { useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BellRing, Bookmark } from "lucide-react";
export default function StationDetails() {
  const { stationId } = useParams();
  const stationStats = [
    {
      label: "Top species",
      value: "Blue whale (162 calls)",
    },
    {
      label: "Total calls (last 7 days)",
      value: "162 calls",
    },
    {
      label: "Noise level",
      value: "Avg 100 dB",
    },
    {
      label: "Last updated",
      value: "2 Hours ago",
    },
  ];
  return (
    <div className="px-4 lg:px-32 py-6 lg:py-10 flex flex-col gap-6">
      <button className="flex flex-row items-center gap-2">
        <ChevronLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
      <section className="flex flex-row border rounded-lg">
        <section className="w-8/12 flex flex-col gap-4 p-6">
          <section className="flex flex-col gap-7">
            <section className="flex flex-col gap-5">
              <section className="flex flex-col gap-4">
                <section className="flex flex-row items-center justify-between">
                  <section className="flex flex-row items-center gap-2.5">
                    <img
                      src="../mbariLogo.svg"
                      alt="mbari-logo"
                      className="w-10 h-10 rounded-full"
                    />
                    <section className="flex flex-col gap-1">
                      <span className="text-base font-medium">
                        Hydrophones station name
                      </span>
                      <section className="flex flex-row items-center gap-2 ">
                        <span className="text-sm font-normal ">
                          Status:
                          <span className="text-[#248600]">
                            {" "}
                            {true ? "Active" : "Inactive"}
                          </span>
                        </span>
                        <span className="text-sm font-extralight text-muted-foreground opacity-45">
                          |
                        </span>
                        <span className="text-sm font-normal text-muted-foreground">
                          Permanent Station
                        </span>
                      </section>
                    </section>
                  </section>
                  <section className="flex flex-row items-center gap-2">
                    <Button variant="outline" className="w-full">
                      Set Alert
                      <BellRing className="w-5 h-5" />
                    </Button>
                    <Button variant="default" className="w-full">
                      Save
                      <Bookmark className="w-5 h-5" />
                    </Button>
                  </section>
                </section>
                <section className="text-sm font-normal">
                  Location <br />
                  California Current, Northeast Pacific
                </section>
              </section>
              <section className="flex flex-row items-center gap-12">
                {stationStats.map((stat) => (
                  <section className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">{stat.label}</span>
                    <span className="text-sm font-normal text-foreground">
                      {stat.value}
                    </span>
                  </section>
                ))}
              </section>
            </section>
            <section className="flex flex-row items-center gap-1.5">
              <Button variant={"default"} className="rounded-full">
                Weekly Stats
              </Button>
              <Button variant={"outline"} className="rounded-full">
                Monthly Stats
              </Button>
              <Button variant={"outline"} className="rounded-full">
                Custom Range
              </Button>
            </section>
          </section>
        </section>
        <section className="w-4/12"></section>
      </section>
    </div>
  );
}
