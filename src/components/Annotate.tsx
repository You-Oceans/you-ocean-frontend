import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Square } from 'lucide-react';

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
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [showLayers] = useState({ ai: true, approved: true, pending: true });
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
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
    setSelectedAnnotation(annotation);
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    setSelectedAnnotation(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'ai': return 'bg-gray-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
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
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <nav className="text-sm text-gray-500 mb-2">
              Hydrophone Station &gt; Spectrogram Viewer
            </nav>
            <h1 className="text-2xl font-bold text-gray-900">Spectrogram Viewer</h1>
            <p className="text-gray-600">Manually label marine mammal sound signatures</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Submit for review
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Clip Navigation */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Clip 1 - Ultra-Low Band (0-50 Hz)</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Square className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">&lt;</Button>
                <span className="text-sm text-gray-600">Clip 1 of 50</span>
                <Button variant="outline" size="sm">&gt;</Button>
              </div>
            </div>
            
            {/* Band Selection */}
            <div className="flex gap-2">
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
          </div>

          {/* Image Container */}
          <div className="relative bg-white border rounded-lg overflow-hidden">
            <div
              ref={containerRef}
              className="relative cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            >
              <img
                ref={imageRef}
                src={sampleImageUrl}
                alt="Spectrogram"
                className="w-full h-[500px] object-cover"
                draggable={false}
              />
              
              {/* Frequency Labels */}
              <div className="absolute left-2 top-2 text-xs font-medium text-gray-600">HIGH</div>
              <div className="absolute left-2 bottom-2 text-xs font-medium text-gray-600">LOW</div>
              
              {/* Time Labels */}
              <div className="absolute bottom-2 left-4 text-xs text-gray-600">0s</div>
              <div className="absolute bottom-2 left-1/4 text-xs text-gray-600">15s</div>
              <div className="absolute bottom-2 left-1/2 text-xs text-gray-600">30s</div>
              <div className="absolute bottom-2 left-3/4 text-xs text-gray-600">45s</div>
              <div className="absolute bottom-2 right-4 text-xs text-gray-600">60s</div>

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
                      {annotation.label || 'Unlabeled'}
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
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l p-6">
          <h3 className="text-lg font-semibold mb-6">Annotations</h3>
          
          {/* Annotation Form */}
          {showAnnotationForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm">Edit Annotation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="species">Species</Label>
                  <Select value={formData.species} onValueChange={(value) => setFormData(prev => ({ ...prev, species: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue-whale">Blue Whale</SelectItem>
                      <SelectItem value="humpback-whale">Humpback Whale</SelectItem>
                      <SelectItem value="fin-whale">Fin Whale</SelectItem>
                      <SelectItem value="gray-whale">Gray Whale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="callType">Call Type</Label>
                  <Select value={formData.callType} onValueChange={(value) => setFormData(prev => ({ ...prev, callType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="song">Song</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="click">Click</SelectItem>
                      <SelectItem value="whistle">Whistle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Enter label"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAnnotationSubmit} className="flex-1">
                    Done
                  </Button>
                  <Button variant="outline" onClick={() => setShowAnnotationForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Annotations List */}
          <div className="space-y-3">
            {annotations.map((annotation) => (
              <Card 
                key={annotation.id} 
                className={`cursor-pointer transition-colors ${selectedAnnotation?.id === annotation.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleAnnotationClick(annotation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-1 h-12 ${getStatusColor(annotation.status)} rounded-full`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {annotation.label || `${annotation.species} - ${annotation.callType}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getStatusLabel(annotation.status)}
                      </div>
                      {annotation.description && (
                        <div className="text-xs text-gray-600 mt-1">
                          {annotation.description}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnnotation(annotation.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
