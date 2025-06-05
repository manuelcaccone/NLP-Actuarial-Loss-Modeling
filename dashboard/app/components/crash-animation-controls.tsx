"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Camera, Eye, AlertTriangle } from "lucide-react"

interface CrashAnimationControlsProps {
  pattern: string
  onPatternChange: (pattern: string) => void
  isPlaying: boolean
  onPlayPause: () => void
  currentStep: number
  onStepChange: (step: number) => void
  speed: number
  onSpeedChange: (speed: number) => void
}

export function CrashAnimationControls({
  pattern,
  onPatternChange,
  isPlaying,
  onPlayPause,
  currentStep,
  onStepChange,
  speed,
  onSpeedChange,
}: CrashAnimationControlsProps) {
  const patterns = {
    "intersection-complexity": {
      name: "Intersection Complexity",
      description: "Complex traffic scenarios at intersections",
      riskScore: 2.15,
      cases: 40,
      gender: "Male",
      steps: 5,
    },
    "road-right": {
      name: "Road-Right Pattern",
      description: "Issues with direction changes and curves",
      riskScore: 1.73,
      cases: 133,
      gender: "Male",
      steps: 5,
    },
    "vehicle-lane": {
      name: "Vehicle-Lane Pattern",
      description: "Lane management and vehicle interaction problems",
      riskScore: 1.7,
      cases: 327,
      gender: "Male",
      steps: 5,
    },
    "vehicle-driver-critical": {
      name: "Vehicle-Driver Critical",
      description: "High severity accidents involving driver factors",
      riskScore: 2.42,
      cases: 19,
      gender: "Female",
      steps: 5,
    },
    "intersection-secondary": {
      name: "Intersection Secondary",
      description: "Secondary intersection challenges",
      riskScore: 1.82,
      cases: 22,
      gender: "Female",
      steps: 5,
    },
  }

  const currentPattern = patterns[pattern as keyof typeof patterns] || patterns["vehicle-lane"]

  const handleReset = () => {
    onStepChange(0)
  }

  const getRiskColor = (score: number) => {
    if (score >= 2.0) return "destructive"
    if (score >= 1.8) return "default"
    return "secondary"
  }

  const getGenderColor = (gender: string) => {
    return gender === "Male" ? "text-blue-400" : "text-pink-400"
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Camera className="h-5 w-5 text-orange-500" />
          Crash Pattern Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pattern Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300">Risk Patterns</label>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {Object.entries(patterns).map(([key, patternData]) => (
              <Button
                key={key}
                variant={pattern === key ? "default" : "outline"}
                onClick={() => onPatternChange(key)}
                className="text-left justify-start h-auto p-3 relative"
              >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{patternData.name}</span>
                    <Badge variant={getRiskColor(patternData.riskScore)} className="text-xs">
                      {patternData.riskScore}
                    </Badge>
                  </div>
                  <div className="text-xs opacity-70 mb-1">{patternData.description}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={getGenderColor(patternData.gender)}>{patternData.gender} Drivers</span>
                    <span className="text-slate-400">{patternData.cases} cases</span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Pattern Info */}
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Active Pattern</span>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-white font-medium">{currentPattern.name}</div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant={getRiskColor(currentPattern.riskScore)}>Risk: {currentPattern.riskScore}</Badge>
              <span className={getGenderColor(currentPattern.gender)}>{currentPattern.gender}</span>
              <span className="text-slate-400">{currentPattern.cases} cases</span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button onClick={onPlayPause} variant="default" size="sm" className="bg-orange-600 hover:bg-orange-700">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>

            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <div className="text-sm text-slate-300 ml-auto">
              Step {currentStep + 1} of {currentPattern.steps}
            </div>
          </div>

          {/* Timeline Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Timeline</label>
            <Slider
              value={[currentStep]}
              onValueChange={(value) => onStepChange(value[0])}
              max={currentPattern.steps - 1}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Animation Speed: {speed}x</label>
            <Slider
              value={[speed]}
              onValueChange={(value) => onSpeedChange(value[0])}
              max={3}
              min={0.5}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>

        {/* Current Step Info */}
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Current Step</span>
          </div>
          <div className="text-sm text-slate-300">
            Step {currentStep + 1}: {currentPattern.name}
          </div>
          <div className="text-xs text-slate-400 mt-1">Use timeline slider or play button to navigate</div>
        </div>
      </CardContent>
    </Card>
  )
}
