import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Calendar, Play, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Download, Eye, EyeOff } from 'lucide-react';
import { Delete } from './icons/Delete';
import { format, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  species: string;
  callType: string;
  status: 'pending' | 'approved' | 'ai';
  author: string;
  startTime: number;
  endTime: number;
  startFrequency: number;
  endFrequency: number;
  imgUrl: string;
  imageIndex: number; // Track which image this annotation belongs to
}

export default function Annotate() {
  // State management
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
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
    species: '',
    callType: ''
  });
  const [customCallType, setCustomCallType] = useState('');
  const [author, setAuthor] = useState('Anonymous');

  const minDate = new Date(2023, 0, 1);
  const maxDate = new Date(2026, 6, 31);

  // Original image dimensions
  const originalWidth = 2850;
  const originalHeight = 2100;
  
  // Rendered image dimensions (adjust based on your actual container size)
  const renderedWidth = 952;
  const renderedHeight = 700;
  
  // Domain ranges
  const timeRange = { min: 0, max: 3600 }; // seconds (1 hour per image)
  const frequencyRange = { min: 0, max: 8000 }; // Hz (linear scale)
  
  // Scaling factors
  const scaleX = renderedWidth / originalWidth;
  const scaleY = renderedHeight / originalHeight;
  
  // Original spectrogram bounding box (from your analysis)
  const originalSpectrogramBbox = {
    x: 191,
    y: 94,
    width: 2229,
    height: 1845
  };
  
  // Calculate scaled spectrogram dimensions and position
  const spectrogramOverlay = {
    left: Math.round(originalSpectrogramBbox.x * scaleX),
    top: Math.round(originalSpectrogramBbox.y * scaleY),
    width: Math.round(originalSpectrogramBbox.width * scaleX),
    height: Math.round(originalSpectrogramBbox.height * scaleY)
  };

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert pixel coordinates to domain coordinates
  const pixelToDomain = useCallback((x: number, y: number) => {
    // Convert to coordinates relative to spectrogram area
    const relativeX = x - spectrogramOverlay.left;
    const relativeY = y - spectrogramOverlay.top;
    
    // Convert to normalized coordinates (0-1)
    const normalizedX = relativeX / spectrogramOverlay.width;
    const normalizedY = relativeY / spectrogramOverlay.height;
    
    // Convert to domain coordinates
    const time = timeRange.min + (normalizedX * (timeRange.max - timeRange.min));
    
    // For frequency (linear scale)
    // Y is inverted (0 at top, max at bottom in pixel coordinates)
    const frequency = frequencyRange.max - (normalizedY * (frequencyRange.max - frequencyRange.min));
    
    return { time, frequency };
  }, [spectrogramOverlay, timeRange, frequencyRange]);

  // Check if point is within spectrogram overlay
  const isWithinOverlay = useCallback((x: number, y: number) => {
    return x >= spectrogramOverlay.left && 
           x <= spectrogramOverlay.left + spectrogramOverlay.width &&
           y >= spectrogramOverlay.top && 
           y <= spectrogramOverlay.top + spectrogramOverlay.height;
  }, [spectrogramOverlay]);

  // Get mouse position relative to container
  const getMousePosition = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

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
      
      const requestOptions = {
        method: "GET",
        redirect: "follow" as RequestRedirect
      };

      const response = await fetch(`https://api-v3.you-oceans.com/data/fetchs3Urls?date=${formattedDate}`, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        console.log(`Loaded ${data.data.length} spectrogram images for ${formattedDate}`);
        setSpectrogramUrls(data.data);
        setCurrentImageIndex(0);
        // Clear annotations when new date is selected
        setAnnotations([]);
      } else {
        console.warn('Invalid response format:', data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching spectrogram URLs:', error);
      // Set empty array instead of fallback images
      setSpectrogramUrls([]);
      setCurrentImageIndex(0);
      setAnnotations([]);
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

  // Mouse event handlers
  const startDrawing = useCallback((e: React.MouseEvent) => {
    // Only allow drawing when image is loaded and visible
    if (!containerRef.current || !imageRef.current || isImageLoading || spectrogramUrls.length === 0) return;
    
    const mousePos = getMousePosition(e);
    
    // Only allow drawing within the spectrogram overlay area
    if (!isWithinOverlay(mousePos.x, mousePos.y)) return;
    
    setIsDrawing(true);
    setCurrentRect({ x: mousePos.x, y: mousePos.y, width: 0, height: 0 });
  }, [isImageLoading, spectrogramUrls.length, getMousePosition, isWithinOverlay]);

  const draw = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !currentRect || !containerRef.current || !imageRef.current || isImageLoading) return;
    
    const mousePos = getMousePosition(e);
    
    // Constrain mouse position to overlay bounds
    const constrainedX = Math.max(
      spectrogramOverlay.left,
      Math.min(mousePos.x, spectrogramOverlay.left + spectrogramOverlay.width)
    );
    const constrainedY = Math.max(
      spectrogramOverlay.top,
      Math.min(mousePos.y, spectrogramOverlay.top + spectrogramOverlay.height)
    );
    
    setCurrentRect({
      x: Math.min(currentRect.x, constrainedX),
      y: Math.min(currentRect.y, constrainedY),
      width: Math.abs(constrainedX - currentRect.x),
      height: Math.abs(constrainedY - currentRect.y)
    });
  }, [isDrawing, currentRect, isImageLoading, getMousePosition, spectrogramOverlay]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !currentRect) return;
    
    // Only create annotation if rectangle has minimum size
    if (currentRect.width > 5 && currentRect.height > 5) {
      setShowAnnotationForm(true);
    } else {
      // Reset drawing state if rectangle is too small
      setCurrentRect(null);
    }
    
    setIsDrawing(false);
  }, [isDrawing, currentRect]);

  // Handle annotation form submission
  const handleAnnotationSubmit = () => {
    if (!currentRect || !containerRef.current || !imageRef.current) return;
    
    // Use custom call type if "other" is selected, otherwise use the selected value
    const finalCallType = formData.callType === 'other' ? customCallType : formData.callType;
    
    // Convert rectangle corners to domain coordinates
    const topLeft = pixelToDomain(currentRect.x, currentRect.y);
    const topRight = pixelToDomain(currentRect.x + currentRect.width, currentRect.y);
    const bottomLeft = pixelToDomain(currentRect.x, currentRect.y + currentRect.height);
    const bottomRight = pixelToDomain(currentRect.x + currentRect.width, currentRect.y + currentRect.height);
    
    // Extract time and frequency ranges
    const startTime = topLeft.time;
    const endTime = topRight.time;
    const startFrequency = bottomLeft.frequency; // Lower frequency (bottom edge)
    const endFrequency = topLeft.frequency; // Higher frequency (top edge)
    
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      x: currentRect.x,
      y: currentRect.y,
      width: currentRect.width,
      height: currentRect.height,
      species: formData.species,
      callType: finalCallType,
      status: 'pending',
      author: author,
      startTime: startTime,
      endTime: endTime,
      startFrequency: startFrequency,
      endFrequency: endFrequency,
      imgUrl: spectrogramUrls[currentImageIndex] || '',
      imageIndex: currentImageIndex // Associate annotation with current image
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    setCurrentRect(null);
    setShowAnnotationForm(false);
    setFormData({ species: '', callType: '' });
    setCustomCallType('');
    
    // Log coordinates to console with detailed debugging
    console.log('🔥 NEW ANNOTATION CREATED:', {
      id: newAnnotation.id,
      imageIndex: currentImageIndex,
      domainCoordinates: {
        topLeft: `(${topLeft.time.toFixed(1)}s, ${topLeft.frequency.toFixed(1)}Hz)`,
        topRight: `(${topRight.time.toFixed(1)}s, ${topRight.frequency.toFixed(1)}Hz)`,
        bottomLeft: `(${bottomLeft.time.toFixed(1)}s, ${bottomLeft.frequency.toFixed(1)}Hz)`,
        bottomRight: `(${bottomRight.time.toFixed(1)}s, ${bottomRight.frequency.toFixed(1)}Hz)`
      },
      annotation: {
        startTime: startTime.toFixed(2) + 's',
        endTime: endTime.toFixed(2) + 's',
        startFrequency: startFrequency.toFixed(2) + 'Hz',
        endFrequency: endFrequency.toFixed(2) + 'Hz',
        species: newAnnotation.species,
        callType: finalCallType
      }
    });
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    console.log('📍 ANNOTATION CLICKED:', {
      id: annotation.id,
      species: annotation.species,
      callType: annotation.callType,
      coordinates: {
        startTime: `${annotation.startTime.toFixed(2)}s`,
        endTime: `${annotation.endTime.toFixed(2)}s`,
        startFrequency: `${annotation.startFrequency.toFixed(2)}Hz`,
        endFrequency: `${annotation.endFrequency.toFixed(2)}Hz`
      }
    });
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  const clearAllAnnotations = () => {
    setAnnotations([]);
    console.log('All annotations cleared');
  };

  // Download annotations as JSON
  const downloadAnnotationsJSON = () => {
    if (annotations.length === 0) {
      console.log('No annotations to download');
      return;
    }

    // Group annotations by image index
    const annotationsByImage = annotations.reduce((acc, ann) => {
      if (!acc[ann.imageIndex]) {
        acc[ann.imageIndex] = [];
      }
      acc[ann.imageIndex].push({
        id: ann.id,
        start_time_seconds: ann.startTime,
        end_time_seconds: ann.endTime,
        start_frequency_hz: ann.startFrequency,
        end_frequency_hz: ann.endFrequency,
        call_type: ann.callType,
        species: ann.species,
        author: ann.author,
        status: ann.status,
        image_url: ann.imgUrl,
        coordinates: {
          top_left: { time: ann.startTime, frequency: ann.endFrequency },
          top_right: { time: ann.endTime, frequency: ann.endFrequency },
          bottom_left: { time: ann.startTime, frequency: ann.startFrequency },
          bottom_right: { time: ann.endTime, frequency: ann.startFrequency }
        }
      });
      return acc;
    }, {} as Record<number, any[]>);

    const annotationData = {
      export_date: new Date().toISOString(),
      selected_date: date ? format(date, 'yyyy-MM-dd') : 'unknown',
      total_images: spectrogramUrls.length,
      total_annotations: annotations.length,
      annotations_by_image: annotationsByImage
    };

    const jsonBlob = new Blob([JSON.stringify(annotationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whale-annotations-${format(date || new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('📊 ANNOTATIONS DOWNLOADED:', annotationData);
  };

  // Playback control functions
  const startPlayback = () => {
    console.log('Starting playback. URLs length:', spectrogramUrls.length);
    if (spectrogramUrls.length === 0 || isImageLoading) return;
    
    setIsPlaying(true);
    setCurrentImageIndex(0);
    
    const interval = setInterval(() => {
      if (!isImageLoading) {
        setCurrentImageIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          console.log('Playback: moving from', prevIndex, 'to', nextIndex);
          if (nextIndex >= spectrogramUrls.length) {
            console.log('Playback finished');
            setIsPlaying(false);
            clearInterval(interval);
            setPlaybackInterval(null);
            return 0; // Reset to first image
          }
          return nextIndex;
        });
      }
    }, 5000); // 5 seconds per image as requested
    
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

  const handleImageError = () => {
    setIsImageLoading(false);
    console.error('Failed to load image:', spectrogramUrls[currentImageIndex]);
  };

  // Navigation functions
  const goToPreviousImage = () => {
    if (spectrogramUrls.length === 0 || isImageLoading || isPlaying) return;
    setCurrentImageIndex((prevIndex) => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : spectrogramUrls.length - 1;
      return newIndex;
    });
  };

  const goToNextImage = () => {
    if (spectrogramUrls.length === 0 || isImageLoading || isPlaying) return;
    setCurrentImageIndex((prevIndex) => {
      const newIndex = prevIndex < spectrogramUrls.length - 1 ? prevIndex + 1 : 0;
      return newIndex;
    });
  };

  // Get current image annotations
  const currentImageAnnotations = annotations.filter(ann => ann.imageIndex === currentImageIndex);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
      }
    };
  }, [playbackInterval]);

  // Utility functions for styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'border-[#248600] bg-[#248600]';
      case 'ai': return 'border-[#5e6166] bg-[#5e6166]';
      case 'pending': return 'border-[#0078e8] bg-[#0078e8]';
      default: return 'border-[#5e6166] bg-[#5e6166]';
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
                {/* Header Controls */}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAnnotations(!showAnnotations)}
                    >
                      {showAnnotations ? (
                        <EyeOff className="w-4 h-4 mr-2" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      {showAnnotations ? 'Hide' : 'Show'} Annotations
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
                      Image {currentImageIndex + 1} of {spectrogramUrls.length || 0}
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
                      <span>0h</span>
                      <span>{currentImageIndex + 1}h / {spectrogramUrls.length}h</span>
                    </div>
                  </div>
                )}

                {/* Spectrogram Image Container */}
                <div className="relative bg-white border rounded-lg overflow-hidden">
                  <div className="flex h-full">
                    {/* Frequency Labels */}
                    <div className="flex flex-col justify-between p-2 w-16 border-r text-xs text-gray-500">
                      <span>8000Hz</span>
                      <span>4000Hz</span>
                      <span>0Hz</span>
                    </div>
                    
                    {/* Main Image Area */}
                    <div 
                      ref={containerRef}
                      className={`flex-1 relative w-[952px] h-full ${spectrogramUrls.length > 0 && !isImageLoading && showAnnotations ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
                      onMouseDown={showAnnotations ? startDrawing : undefined}
                      onMouseMove={showAnnotations ? draw : undefined}
                      onMouseUp={showAnnotations ? stopDrawing : undefined}
                      onMouseLeave={showAnnotations ? stopDrawing : undefined}
                    >
                      {spectrogramUrls.length > 0 ? (
                        <>
                          <img
                            ref={imageRef}
                            key={`${spectrogramUrls[currentImageIndex]}-${currentImageIndex}`}
                            src={spectrogramUrls[currentImageIndex]}
                            alt={`Spectrogram ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain"
                            draggable={false}
                            crossOrigin="anonymous"
                            onLoadStart={handleImageLoadStart}
                            onLoad={handleImageLoadComplete}
                            onError={handleImageError}
                          />
                          {/* Spectrogram overlay area for debugging */}
                          <div 
                            className="absolute  bg-transparent bg-opacity-10 pointer-events-none"
                            style={{
                              left: `${spectrogramOverlay.left}px`,
                              top: `${spectrogramOverlay.top}px`,
                              width: `${spectrogramOverlay.width}px`,
                              height: `${spectrogramOverlay.height}px`,
                            }}
                            title="Spectrogram annotation area"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <div className="text-center text-gray-500">
                            <div className="text-lg font-medium mb-2">No spectrogram data available</div>
                            <div className="text-sm">Please select a different date</div>
                          </div>
                        </div>
                      )}

                      {/* Image Loading Overlay */}
                      {isImageLoading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-gray-700 font-medium">Loading image...</span>
                          </div>
                        </div>
                      )}

                      {/* Existing Annotations for Current Image */}
                      {showAnnotations && currentImageAnnotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className={`absolute border-2 ${getStatusColor(annotation.status)} bg-opacity-20 cursor-pointer hover:bg-opacity-30`}
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
                      ))}

                      {/* Current Drawing Rectangle */}
                      {showAnnotations && currentRect && (
                        <div
                          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                          style={{
                            left: currentRect.x,
                            top: currentRect.y,
                            width: currentRect.width,
                            height: currentRect.height,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="bg-white relative w-[427px] h-full border-l border-[#ebeef5]">
          <div className="flex flex-col gap-[24px] items-start p-[18px] h-full">
            {/* Title and Action Buttons */}
            <div className="flex items-center justify-between w-full">
              <div className="font-medium text-[18px] text-[#0e131a] leading-[22px]">
                Annotations
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAnnotationsJSON}
                  disabled={annotations.length === 0}
                  className="h-8 px-3 text-xs hover:bg-gray-50 border-gray-200 transition-colors"
                  title="Download annotations as JSON"
                >
                  <Download className="w-3 h-3 mr-1" />
                  JSON
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
              <div className="bg-[#f7f9fc] flex flex-col gap-[24px] items-start p-[12px] rounded-[6px] w-full">
                <div className="font-medium text-[16px] text-[#0e131a] leading-[19px]">
                  Edit Annotation
                </div>
                
                <div className="flex flex-col gap-[16px] items-start w-full">
                  {/* Author Field */}
                  <div className="flex flex-col gap-[6px] items-start w-full">
                    <div className="font-normal text-[14px] text-[#131a24] leading-[17px]">
                      Author
                    </div>
                    <Input
                      placeholder="Enter your name"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="h-[38px] bg-white border-[#dde1eb] rounded-[8px] px-[12px] font-normal text-[14px] text-[#131a24] leading-[17px] focus:ring-0 focus:ring-offset-0 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  {/* Species Field */}
                  <div className="flex flex-col gap-[6px] items-start w-full">
                    <div className="font-normal text-[14px] text-[#131a24] leading-[17px]">
                      Species
                    </div>
                    <Select value={formData.species} onValueChange={(value) => setFormData(prev => ({ ...prev, species: value }))}>
                      <SelectTrigger className="h-[38px] bg-white border-[#dde1eb] rounded-[8px] pl-[12px] pr-[8px] font-normal text-[14px] text-[#5e6166] leading-[17px] focus:ring-0 focus:ring-offset-0 focus:border-[#dde1eb]">
                        <SelectValue placeholder="Select" className="font-normal text-[14px] text-[#5e6166] leading-[17px]" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue-whale">Blue Whale</SelectItem>
                        <SelectItem value="fin-whale">Fin Whale</SelectItem>
                        <SelectItem value="gray-whale">Gray Whale</SelectItem>
                        <SelectItem value="ship">Ship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Call Type Field */}
                  <div className="flex flex-col gap-[6px] items-start w-full">
                    <div className="font-normal text-[14px] text-[#131a24] leading-[17px]">
                      Call Type
                    </div>
                    <Select value={formData.callType} onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, callType: value }));
                      if (value !== 'other') {
                        setCustomCallType('');
                      }
                    }}>
                      <SelectTrigger className="h-[38px] bg-white border-[#dde1eb] rounded-[8px] pl-[12px] pr-[8px] font-normal text-[14px] text-[#5e6166] leading-[17px] focus:ring-0 focus:ring-offset-0 focus:border-[#dde1eb]">
                        <SelectValue placeholder="Select call type" className="font-normal text-[14px] text-[#5e6166] leading-[17px]" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="song">Song</SelectItem>
                        <SelectItem value="horn">Horn</SelectItem>
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
                <div className="flex gap-[8px] h-[42px] items-start w-full">
                  <div className="flex-1 bg-[#131a24] flex items-center justify-center h-[36px] p-[12px] rounded-[6px] cursor-pointer" onClick={handleAnnotationSubmit}>
                    <div className="font-medium text-[14px] text-white leading-[16px]">
                      Done
                    </div>
                  </div>
                  <div className="bg-white border border-[#ebeef5] flex items-center justify-center h-[36px] p-[12px] rounded-[6px] w-[42px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06)] cursor-pointer" onClick={() => setShowAnnotationForm(false)}>
                    <Delete className="w-[16px] h-[16px] text-[#5e6166]" />
                  </div>
                </div>
              </div>
            )}

            {/* Annotations List */}
            <div className="flex flex-col gap-[8px] items-start w-full overflow-y-auto flex-1">
              <div className="text-sm text-gray-600 mb-2">
                Image {currentImageIndex + 1}: {currentImageAnnotations.length} annotation(s)
              </div>
              {currentImageAnnotations.length > 0 ? (
                currentImageAnnotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="border border-[#e7e7e8] flex gap-[12px] items-center p-[12px] rounded-[6px] w-full cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAnnotationClick(annotation)}
                  >
                    <div className={`h-[42px] rounded-[60px] w-[4px] ${getStatusColor(annotation.status).split(' ')[1]}`} />
                    <div className="flex flex-col gap-[6px] items-start flex-1">
                      <div className="flex flex-col gap-[6px] items-start font-normal text-[14px] leading-[17px]">
                        <div className="text-[#0e131a]">
                          {annotation.species} - {annotation.callType}
                        </div>
                        <div className="text-[#5e6166]">
                          {getStatusLabel(annotation.status)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {annotation.startTime.toFixed(1)}s - {annotation.endTime.toFixed(1)}s
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnnotation(annotation.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <X className="w-4 h-4 text-[#5e6166]" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-[#5e6166] text-center w-full py-8">
                  No annotations for this image
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
