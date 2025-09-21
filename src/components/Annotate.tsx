import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Calendar, Play, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Download } from 'lucide-react';
import { Delete } from './icons/Delete';
import { format, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [spectrogramUrls, setSpectrogramUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackInterval, setPlaybackInterval] = useState<NodeJS.Timeout | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    species: '',
    callType: ''
  });
  const [customCallType, setCustomCallType] = useState('');

  const minDate = new Date(2023, 0, 1);
  const maxDate = new Date(2026, 6, 31);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch spectrogram URLs from API
  const fetchSpectrogramUrls = async (selectedDate: Date) => {
    try {
      // Fix timezone issue - use local date formatting
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      console.log('Selected date:', selectedDate);
      console.log('Formatted date for API:', formattedDate);
      
      const response = await fetch(`https://api-v3.you-oceans.com/data/fetchs3Urls?date=${formattedDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        console.log(`Loaded ${data.data.length} spectrogram images for ${formattedDate}`);
        setSpectrogramUrls(data.data);
        setCurrentImageIndex(0);
      } else {
        console.warn('Invalid response format:', data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching spectrogram URLs:', error);
      // Fallback to sample images for testing
      const fallbackUrls = Array.from({ length: 5 }, (_, i) => `/download.png?t=${i}`);
      setSpectrogramUrls(fallbackUrls);
      setCurrentImageIndex(0);
    }
  };

  // Handle date selection and API call
  const handleDateSelect = async (selectedDate: Date | undefined) => {
    if (selectedDate && !isBefore(selectedDate, minDate) && !isAfter(selectedDate, maxDate)) {
      setDate(selectedDate);
      setIsDatePickerOpen(false);
      setIsLoading(true);
      
      // Stop any playing animation
      stopPlayback();
      
      // Fetch spectrogram URLs for the selected date
      await fetchSpectrogramUrls(selectedDate);
      
      setIsLoading(false);
    }
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
    
    // Use custom call type if "other" is selected, otherwise use the selected value
    const finalCallType = formData.callType === 'other' ? customCallType : formData.callType;
    
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      x: Math.min(currentRect.x, currentRect.x + currentRect.width),
      y: Math.min(currentRect.y, currentRect.y + currentRect.height),
      width: Math.abs(currentRect.width),
      height: Math.abs(currentRect.height),
      label: formData.label,
      description: formData.description,
      species: formData.species,
      callType: finalCallType,
      status: 'pending'
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    setCurrentRect(null);
    setShowAnnotationForm(false);
    setFormData({ label: '', description: '', species: '', callType: '' });
    setCustomCallType('');
    
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
        callType: finalCallType
      }
    });
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    console.log('Annotation clicked:', annotation);
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  const clearAllAnnotations = () => {
    setAnnotations([]);
    console.log('All annotations cleared');
  };

  const downloadAnnotatedImage = async () => {
    if (!imageRef.current || !containerRef.current) return;

    try {
      // Create a canvas to draw the image with annotations
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = imageRef.current;
      const container = containerRef.current;
      
      // Set canvas size to match the image's natural size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Calculate the scale factors
      const containerRect = container.getBoundingClientRect();
      const scaleX = img.naturalWidth / containerRect.width;
      const scaleY = img.naturalHeight / containerRect.height;

      // Create a new image element with CORS headers to avoid tainted canvas
      const corsImage = new Image();
      corsImage.crossOrigin = 'anonymous';
      
      // Wait for the image to load
      await new Promise((resolve, reject) => {
        corsImage.onload = resolve;
        corsImage.onerror = reject;
        corsImage.src = img.src;
      });

      // Draw the image
      ctx.drawImage(corsImage, 0, 0);

      // Draw annotations
      annotations.forEach((annotation) => {
        if (!showLayers[annotation.status as keyof typeof showLayers]) return;

        // Scale the annotation coordinates to match the natural image size
        const scaledX = annotation.x * scaleX;
        const scaledY = annotation.y * scaleY;
        const scaledWidth = annotation.width * scaleX;
        const scaledHeight = annotation.height * scaleY;

        // Set stroke style based on annotation status
        let strokeColor;
        switch (annotation.status) {
          case 'approved': strokeColor = '#248600'; break;
          case 'ai': strokeColor = '#5e6166'; break;
          case 'pending': strokeColor = '#0078e8'; break;
          default: strokeColor = '#5e6166'; break;
        }

        // Draw the annotation rectangle
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

        // Draw the annotation label
        if (annotation.species) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.font = '16px Arial';
          const textMetrics = ctx.measureText(annotation.species);
          const textWidth = textMetrics.width;
          const textHeight = 20;
          
          // Draw background for text
          ctx.fillRect(scaledX, scaledY - textHeight - 5, textWidth + 10, textHeight + 5);
          
          // Draw text
          ctx.fillStyle = 'white';
          ctx.fillText(annotation.species, scaledX + 5, scaledY - 8);
        }
      });

      // Create download link
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `annotated-spectrogram-${format(date || new Date(), 'yyyy-MM-dd')}-${currentImageIndex + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Annotated image downloaded successfully');
      }, 'image/png');

    } catch (error) {
      console.error('Error downloading annotated image:', error);
      
      // Fallback: Download annotations as JSON data if image download fails
      const annotationData = {
        date: date ? format(date, 'yyyy-MM-dd') : 'unknown',
        imageIndex: currentImageIndex + 1,
        imageUrl: spectrogramUrls[currentImageIndex] || 'unknown',
        annotations: annotations.map(ann => ({
          id: ann.id,
          coordinates: { x: ann.x, y: ann.y, width: ann.width, height: ann.height },
          species: ann.species,
          callType: ann.callType,
          label: ann.label,
          description: ann.description,
          status: ann.status
        }))
      };

      const jsonBlob = new Blob([JSON.stringify(annotationData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `annotations-${format(date || new Date(), 'yyyy-MM-dd')}-${currentImageIndex + 1}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Downloaded annotations as JSON due to CORS restrictions');
      
      // You could also show a toast notification here
      alert('Image download failed due to CORS restrictions. Annotations saved as JSON file instead.');
    }
  };

  // Playback control functions
  const startPlayback = () => {
    console.log('Starting playback. URLs length:', spectrogramUrls.length);
    if (spectrogramUrls.length === 0 || isImageLoading) return;
    
    setIsPlaying(true);
    setCurrentImageIndex(0);
    
    const interval = setInterval(() => {
      // Only advance if not loading an image
      if (!isImageLoading) {
        setCurrentImageIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          console.log('Playback: moving from', prevIndex, 'to', nextIndex);
          if (nextIndex >= spectrogramUrls.length) {
            // End of playback
            console.log('Playback finished');
            setIsPlaying(false);
            clearInterval(interval);
            setPlaybackInterval(null);
            return 0; // Reset to first image
          }
          return nextIndex;
        });
      }
    }, 2000); // 2 seconds per image
    
    setPlaybackInterval(interval);
  };

  const stopPlayback = () => {
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Image loading handlers
  const handleImageLoadStart = () => {
    setIsImageLoading(true);
  };

  const handleImageLoadComplete = () => {
    setIsImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsImageLoading(false);
    console.error('Failed to load image:', spectrogramUrls[currentImageIndex]);
    // Fallback to sample image on error
    e.currentTarget.src = '/download.png';
  };

  // Navigation functions
  const goToPreviousImage = () => {
    console.log('Previous clicked. Current index:', currentImageIndex, 'Total URLs:', spectrogramUrls.length);
    if (spectrogramUrls.length === 0 || isImageLoading) return;
    setCurrentImageIndex((prevIndex) => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : spectrogramUrls.length - 1;
      console.log('Moving to previous image:', newIndex);
      return newIndex;
    });
  };

  const goToNextImage = () => {
    console.log('Next clicked. Current index:', currentImageIndex, 'Total URLs:', spectrogramUrls.length);
    if (spectrogramUrls.length === 0 || isImageLoading) return;
    setCurrentImageIndex((prevIndex) => {
      const newIndex = prevIndex < spectrogramUrls.length - 1 ? prevIndex + 1 : 0;
      console.log('Moving to next image:', newIndex);
      return newIndex;
    });
  };

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
      }
    };
  }, [playbackInterval]);

  // Debug: log when currentImageIndex changes and trigger loading
  React.useEffect(() => {
    console.log('Current image index changed to:', currentImageIndex);
    console.log('Current image URL:', spectrogramUrls[currentImageIndex]);
    // Reset loading state when index changes (new image will trigger onLoadStart)
    if (spectrogramUrls.length > 0) {
      setIsImageLoading(true);
    }
  }, [currentImageIndex, spectrogramUrls]);

  // Debug: log when spectrogramUrls changes
  React.useEffect(() => {
    console.log('Spectrogram URLs updated:', spectrogramUrls.length, 'images');
  }, [spectrogramUrls]);

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
          {/* Custom shadcn Date Selector */}
          <div className="mb-6">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-between text-left font-normal bg-white hover:bg-gray-50 border-gray-200 transition-colors",
                    !date && "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <CalendarIcon className="mr-3 h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {date ? format(date, "EEEE, MMMM d, yyyy") : "Select a date"}
                    </span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 shadow-lg border-gray-200" align="start">
                <div className="p-4 border-b border-gray-100">
                  <h4 className="font-medium text-sm text-gray-900">Select Date</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a date to load spectrogram data for annotation
                  </p>
                </div>
                <div className="p-4">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={(date) => isBefore(date, minDate) || isAfter(date, maxDate)}
                    className="rounded-md"
                  />
                </div>
              </PopoverContent>
            </Popover>
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
                      <h2 className="text-lg font-semibold">Spectrogram Visualisation</h2>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={togglePlayback}
                        disabled={spectrogramUrls.length === 0 || isImageLoading}
                      >
                        {isPlaying ? (
                          <X className="w-4 h-4 mr-2" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        {isPlaying ? 'Stop' : 'Play'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={goToPreviousImage}
                        disabled={spectrogramUrls.length === 0 || isPlaying || isImageLoading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        Pic {currentImageIndex + 1} of {spectrogramUrls.length || 0}
                        {isImageLoading && " (Loading...)"}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={goToNextImage}
                        disabled={spectrogramUrls.length === 0 || isPlaying || isImageLoading}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Playback Progress Bar */}
                  {isPlaying && spectrogramUrls.length > 0 && (
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((currentImageIndex + 1) / spectrogramUrls.length) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0s</span>
                        <span>{Math.round((currentImageIndex + 1) * 2)}s / {spectrogramUrls.length * 2}s</span>
                      </div>
                    </div>
                  )}
                
                {/* Band Selection
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
                </div> */}

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
                        src={spectrogramUrls.length > 0 ? spectrogramUrls[currentImageIndex] : '/download.png'}
                        alt={`Spectrogram ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain"
                        draggable={false}
                        crossOrigin="anonymous"
                        onLoadStart={handleImageLoadStart}
                        onLoad={handleImageLoadComplete}
                        onError={handleImageError}
                      />

                      {/* Image Loading Overlay */}
                      {isImageLoading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-gray-700 font-medium">Loading image...</span>
                          </div>
                        </div>
                      )}

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

        {/* Sidebar */}
        <div className="bg-white relative w-[427px] h-full border-l border-[#ebeef5]" data-node-id="152:342">
          <div className="flex flex-col gap-[24px] items-start p-[18px] h-full">
            {/* Title and Action Buttons */}
            <div className="flex items-center justify-between w-full">
              <div className="font-medium text-[18px] text-[#0e131a] leading-[22px]" data-node-id="152:343">
                Annotations
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAnnotatedImage}
                  disabled={!date || spectrogramUrls.length === 0 || isImageLoading}
                  className="h-8 px-3 text-xs hover:bg-gray-50 border-gray-200 transition-colors"
                  title="Download annotated image"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllAnnotations}
                  disabled={annotations.length === 0}
                  className="h-8 px-3 text-xs hover:bg-red-50 border-gray-200 hover:border-red-200 hover:text-red-600 transition-colors"
                  title="Clear all annotations"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
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
                        <SelectItem value="blue-whale">Blue Whale</SelectItem>
                        <SelectItem value="humpback-whale">Humpback Whale</SelectItem>
                        <SelectItem value="fin-whale">Fin Whale</SelectItem>
                        <SelectItem value="ship">Gray Whale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Call Type Field */}
                  <div className="flex flex-col gap-[6px] items-start w-full" data-node-id="152:355">
                    <div className="font-normal text-[14px] text-[#131a24] leading-[17px]" data-node-id="152:356">
                      Call Type
                    </div>
                    <Select value={formData.callType} onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, callType: value }));
                      if (value !== 'other') {
                        setCustomCallType('');
                      }
                    }}>
                      <SelectTrigger className="h-[38px] bg-white border-[#dde1eb] rounded-[8px] pl-[12px] pr-[8px] font-normal text-[14px] text-[#5e6166] leading-[17px] focus:ring-0 focus:ring-offset-0 focus:border-[#dde1eb]" data-node-id="152:357">
                        <SelectValue placeholder="Select call type" className="font-normal text-[14px] text-[#5e6166] leading-[17px]" data-node-id="152:358" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="song">Song</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="click">Click</SelectItem>
                        <SelectItem value="whistle">Whistle</SelectItem>
                        <SelectItem value="burst">Burst</SelectItem>
                        <SelectItem value="moan">Moan</SelectItem>
                        <SelectItem value="grunt">Grunt</SelectItem>
                        <SelectItem value="tonal">Tonal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Custom Call Type Input - shown when "Other" is selected */}
                    {formData.callType === 'other' && (
                      <div className="w-full mt-2">
                        <Input
                          placeholder="Enter custom call type"
                          value={customCallType}
                          onChange={(e) => setCustomCallType(e.target.value)}
                          className="h-[38px] bg-white border-[#dde1eb] rounded-[8px] px-[12px] font-normal text-[14px] text-[#131a24] leading-[17px] focus:ring-0 focus:ring-offset-0 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    )}
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
