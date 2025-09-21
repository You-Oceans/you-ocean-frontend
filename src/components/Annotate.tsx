import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Calendar, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateSelector } from './DateSelector';
import { Delete } from './icons/Delete';

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  description: string;
  species: string;
  callType: string;
  status: 'pending' | 'approved' | 'ai';
}

export default function Annotate() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [showLayers] = useState({ ai: true, approved: true, pending: true });
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    species: '',
    callType: ''
  });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sample image URL - replace with your actual image
  const sampleImageUrl = '/download.png';

  // Simulate API call when date is selected
  const handleDateSelect = async (selectedDate: Date) => {
    setDate(selectedDate);
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate loading some data based on the date
    console.log('Loading data for date:', selectedDate);
    setIsLoading(false);
  };

  const startDrawing = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentRect({ x, y, width: 0, height: 0 });
  }, []);

  const draw = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !currentRect || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentRect({
      ...currentRect,
      width: x - currentRect.x,
      height: y - currentRect.y
    });
  }, [isDrawing, currentRect]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !currentRect) return;
    
    // Only create annotation if rectangle has minimum size
    if (Math.abs(currentRect.width) > 10 && Math.abs(currentRect.height) > 10) {
      setShowAnnotationForm(true);
    }
    
    setIsDrawing(false);
  }, [isDrawing, currentRect]);

  const handleAnnotationSubmit = () => {
    if (!currentRect) return;
    
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      x: Math.min(currentRect.x, currentRect.x + currentRect.width),
      y: Math.min(currentRect.y, currentRect.y + currentRect.height),
      width: Math.abs(currentRect.width),
      height: Math.abs(currentRect.height),
      label: formData.label,
      description: formData.description,
      species: formData.species,
      callType: formData.callType,
      status: 'pending'
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    setCurrentRect(null);
    setShowAnnotationForm(false);
    setFormData({ label: '', description: '', species: '', callType: '' });
    
    // Log coordinates to console
    console.log('Annotation created:', {
      id: newAnnotation.id,
      coordinates: {
        x: newAnnotation.x,
        y: newAnnotation.y,
        width: newAnnotation.width,
        height: newAnnotation.height
      },
      data: {
        label: newAnnotation.label,
        description: newAnnotation.description,
        species: newAnnotation.species,
        callType: newAnnotation.callType
      }
    });
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    console.log('Annotation clicked:', annotation);
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-[#248600]';
      case 'ai': return 'bg-[#5e6166]';
      case 'pending': return 'bg-[#0078e8]';
      default: return 'bg-[#5e6166]';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Admin Approved';
      case 'ai': return 'AI Annotation';
      case 'pending': return 'Pending annotation';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Date Selector */}
          <div className="mb-6">
            <DateSelector 
              date={date || undefined} 
              onDateChange={(newDate) => {
                if (newDate) {
                  handleDateSelect(newDate);
                }
              }}
              minDate={new Date(2024, 0, 1)}
              maxDate={new Date(2024, 6, 31)}
            />
          </div>

          {/* Conditional Content */}
          {!date ? (
            <div className="flex-1 flex items-center justify-center h-96">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a date first to visualize</h3>
                <p className="text-gray-500">Choose a date to load spectrogram data for annotation</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading spectrogram data...</p>
              </div>
            </div>
          ) : (
            <Card className="w-full">
              <CardContent className="p-6">
                {/* Clip Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Clip 1 - Ultra-Low Band (0-50 Hz)</h2>
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">Clip 1 of 50</span>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Band Selection */}
                <div className="flex gap-2 mb-6">
                  {['Ultra-Low', 'Low', 'Mid', 'High', 'Ultra-High'].map((band) => (
                    <Button
                      key={band}
                      variant={band === 'Ultra-Low' ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                    >
                      {band}
                    </Button>
                  ))}
                </div>

                {/* Spectrogram Image Container */}
                <div className="relative bg-white border rounded-lg overflow-hidden h-[500px]">
                  <div className="flex h-full">
                    {/* Frequency Labels */}
                    <div className="flex flex-col justify-between p-2 w-12 border-r text-xs text-gray-500">
                      <span>HIGH</span>
                      <span>LOW</span>
                    </div>
                    
                    {/* Main Image Area */}
                    <div 
                      ref={containerRef}
                      className="flex-1 relative cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    >
                      <img
                        ref={imageRef}
                        src={sampleImageUrl}
                        alt="Spectrogram"
                        className="w-full h-full object-contain"
                        draggable={false}
                      />

                      {/* Existing Annotations */}
                      {annotations.map((annotation) => {
                        if (!showLayers[annotation.status as keyof typeof showLayers]) return null;
                        
                        return (
                          <div
                            key={annotation.id}
                            className={`absolute border-2 ${getStatusColor(annotation.status)} border-opacity-70 bg-${getStatusColor(annotation.status)} bg-opacity-20 cursor-pointer hover:bg-opacity-30`}
                            style={{
                              left: annotation.x,
                              top: annotation.y,
                              width: annotation.width,
                              height: annotation.height,
                            }}
                            onClick={() => handleAnnotationClick(annotation)}
                          >
                            <div className="absolute -top-6 left-0 text-xs bg-black bg-opacity-75 text-white px-2 py-1 rounded">
                              {annotation.species || 'Unlabeled'}
                            </div>
                          </div>
                        );
                      })}

                      {/* Current Drawing Rectangle */}
                      {currentRect && (
                        <div
                          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                          style={{
                            left: Math.min(currentRect.x, currentRect.x + currentRect.width),
                            top: Math.min(currentRect.y, currentRect.y + currentRect.height),
                            width: Math.abs(currentRect.width),
                            height: Math.abs(currentRect.height),
                          }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Time Labels */}
                  <div className="absolute bottom-2 left-4 text-xs text-gray-600">0s</div>
                  <div className="absolute bottom-2 left-1/4 text-xs text-gray-600">15s</div>
                  <div className="absolute bottom-2 left-1/2 text-xs text-gray-600">30s</div>
                  <div className="absolute bottom-2 left-3/4 text-xs text-gray-600">45s</div>
                  <div className="absolute bottom-2 right-4 text-xs text-gray-600">60s</div>

                  {/* Show Layers Legend */}
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded">
                    <div className="text-xs mb-1">Show layers:</div>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span>AI Annotations</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Approved</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Exact Figma Design */}
        <div className="bg-white relative w-[427px] h-full border-l border-[#ebeef5]" data-node-id="152:342">
          <div className="flex flex-col gap-[24px] items-start p-[18px] h-full">
            {/* Title */}
            <div className="font-medium text-[18px] text-[#0e131a] leading-[22px]" data-node-id="152:343">
              Annotations
            </div>
            
            {/* Edit Annotation Section */}
            {showAnnotationForm && (
              <div className="bg-[#f7f9fc] flex flex-col gap-[24px] items-start p-[12px] rounded-[6px] w-full" data-node-id="152:344">
                <div className="font-medium text-[16px] text-[#0e131a] leading-[19px]" data-node-id="152:345">
                  Edit Annotation
                </div>
                
                <div className="flex flex-col gap-[16px] items-start w-full" data-node-id="152:346">
                  {/* Species Field */}
                  <div className="flex flex-col gap-[6px] items-start w-full" data-node-id="152:347">
                    <div className="font-normal text-[14px] text-[#131a24] leading-[17px]" data-node-id="152:348">
                      Species
                    </div>
                    <Select value={formData.species} onValueChange={(value) => setFormData(prev => ({ ...prev, species: value }))}>
                      <SelectTrigger className="h-[38px] bg-white border-[#dde1eb] rounded-[8px] pl-[12px] pr-[8px] font-normal text-[14px] text-[#5e6166] leading-[17px] focus:ring-0 focus:ring-offset-0 focus:border-[#dde1eb]" data-node-id="152:349">
                        <SelectValue placeholder="Select" className="font-normal text-[14px] text-[#5e6166] leading-[17px]" data-node-id="152:350" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue-a-whale">Blue A Whale</SelectItem>
                        <SelectItem value="blue-b-whale">Blue B Whale</SelectItem>
                        <SelectItem value="humpback-whale">Humpback Whale</SelectItem>
                        <SelectItem value="fin-whale">Fin Whale</SelectItem>
                        <SelectItem value="ship">Ship</SelectItem>
                        <SelectItem value="earthquake">Earthquake</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Call Type Field */}
                  <div className="flex flex-col gap-[6px] items-start w-full" data-node-id="152:355">
                    <div className="font-normal text-[14px] text-[#131a24] leading-[17px]" data-node-id="152:356">
                      Call Type
                    </div>
                    <Select value={formData.callType} onValueChange={(value) => setFormData(prev => ({ ...prev, callType: value }))}>
                      <SelectTrigger className="h-[38px] bg-white border-[#dde1eb] rounded-[8px] pl-[12px] pr-[8px] font-normal text-[14px] text-[#5e6166] leading-[17px] focus:ring-0 focus:ring-offset-0 focus:border-[#dde1eb]" data-node-id="152:357">
                        <SelectValue placeholder="Select" className="font-normal text-[14px] text-[#5e6166] leading-[17px]" data-node-id="152:358" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="song">Song</SelectItem>
                        <SelectItem value="general-sound">General Sound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-[8px] h-[42px] items-start w-full" data-node-id="152:363">
                  <div className="flex-1 bg-[#131a24] flex items-center justify-center h-[36px] p-[12px] rounded-[6px]" data-node-id="152:364" onClick={handleAnnotationSubmit}>
                    <div className="font-medium text-[14px] text-white leading-[16px]" data-node-id="152:365">
                      Done
                    </div>
                  </div>
                  <div className="bg-white border border-[#ebeef5] flex items-center justify-center h-[36px] p-[12px] rounded-[6px] w-[42px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06)]" data-node-id="152:366" onClick={() => setShowAnnotationForm(false)}>
                    <Delete className="w-[16px] h-[16px] text-[#5e6166]" />
                  </div>
                </div>
              </div>
            )}

            {/* Annotations List */}
            <div className="flex flex-col gap-[8px] items-start w-full" data-node-id="152:370">
              {annotations.length > 0 ? (
                // Dynamic Annotations List
                annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="border border-[#e7e7e8] flex gap-[12px] items-center p-[12px] rounded-[6px] w-full cursor-pointer"
                    onClick={() => handleAnnotationClick(annotation)}
                  >
                    <div className={`h-[42px] rounded-[60px] w-[4px] ${getStatusColor(annotation.status)}`} />
                    <div className="flex flex-col gap-[6px] items-start flex-1">
                      <div className="flex flex-col gap-[6px] items-start font-normal text-[14px] leading-[17px]">
                        <div className="text-[#0e131a]">
                          {annotation.label || `${annotation.species} - ${annotation.callType}`}
                        </div>
                        <div className="text-[#5e6166]">
                          {getStatusLabel(annotation.status)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnnotation(annotation.id);
                      }}
                      className="p-1"
                    >
                      <X className="w-4 h-4 text-[#5e6166]" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-[#5e6166]">No annotations found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
