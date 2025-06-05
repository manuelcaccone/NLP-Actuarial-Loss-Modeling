"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CrashScene } from "./components/3d-crash-scene"
import { CrashAnimationControls } from "./components/crash-animation-controls"

export default function RiskDashboard() {
  const [crashPattern, setCrashPattern] = useState("intersection-complexity")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(1)

  // Reset step when pattern changes
  useEffect(() => {
    setCurrentStep(0)
    setIsPlaying(false)
  }, [crashPattern])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const patternData = {
    "intersection-complexity": {
      name: "Intersection Complexity Pattern",
      riskScore: 2.15,
      cases: 40,
      gender: "Male",
      keywords: "v2 >> v1 >> intersection >> vehicle >> lane >> critical",
      insight: "Greater propensity for risk in complex traffic scenarios.",
    },
    "road-right": {
      name: "Road-Right Pattern",
      riskScore: 1.73,
      cases: 133,
      gender: "Male",
      keywords: "road >> right >> v1 >> vehicle >> driver >> roadway >> left",
      insight: "Issues with changing direction and navigating curves.",
    },
    "vehicle-lane": {
      name: "Vehicle-Lane Pattern",
      riskScore: 1.7,
      cases: 327,
      gender: "Male",
      keywords: "vehicle >> v1 >> driver >> lane >> v2 >> crash >> critical",
      insight: "Problems with lane management and vehicle interaction.",
    },
    "vehicle-driver-critical": {
      name: "Vehicle-Driver Critical Pattern",
      riskScore: 2.42,
      cases: 19,
      gender: "Female",
      keywords: "vehicle >> driver >> v2 >> v1 >> lane >> critical",
      insight: "When females are involved in accidents, the severity tends to be higher.",
    },
    "intersection-secondary": {
      name: "Intersection Secondary Pattern",
      riskScore: 1.82,
      cases: 22,
      gender: "Female",
      keywords: "v2 >> v1 >> intersection >> vehicle >> lane >> critical",
      insight: "Similar intersection challenges as males, but with different frequency.",
    },
  }

  const currentPatternData = patternData[crashPattern as keyof typeof patternData]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">3D Crash Scene Reconstruction Dashboard</h1>
          <p className="text-lg text-slate-300">
            Interactive 3D visualization of all 5 driving risk patterns with enhanced animations
          </p>
        </div>

        {/* Main 3D Crash Scene */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-center">3D Crash Scene Reconstruction</CardTitle>
                <p className="text-slate-300 text-center">
                  Enhanced visualization with realistic vehicle models, damage effects, and environmental details
                </p>
              </CardHeader>
              <CardContent>
                <CrashScene
                  pattern={crashPattern}
                  isPlaying={isPlaying}
                  currentStep={currentStep}
                  onStepChange={handleStepChange}
                  speed={speed}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <CrashAnimationControls
              pattern={crashPattern}
              onPatternChange={setCrashPattern}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              currentStep={currentStep}
              onStepChange={handleStepChange}
              speed={speed}
              onSpeedChange={setSpeed}
            />
          </div>
        </div>

        {/* Enhanced Risk Pattern Information */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Current Pattern Analysis</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4
                  className={`font-semibold text-lg ${currentPatternData.gender === "Male" ? "text-blue-400" : "text-pink-400"}`}
                >
                  {currentPatternData.name}
                </h4>
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Risk Score</p>
                      <p className="text-2xl font-bold text-white">{currentPatternData.riskScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Cases</p>
                      <p className="text-2xl font-bold text-white">{currentPatternData.cases}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Gender</p>
                    <p
                      className={`text-sm font-medium ${currentPatternData.gender === "Male" ? "text-blue-400" : "text-pink-400"}`}
                    >
                      {currentPatternData.gender} Drivers
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-orange-400">Pattern Details</h4>
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Keywords</p>
                    <p className="text-sm">{currentPatternData.keywords}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Behavioral Insight</p>
                    <p className="text-sm">{currentPatternData.insight}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Risk Pattern Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-400">Male Driver Patterns</h4>
                <ul className="text-sm space-y-1">
                  <li>• Intersection Complexity: 2.15 risk (40 cases)</li>
                  <li>• Road-Right: 1.73 risk (133 cases)</li>
                  <li>• Vehicle-Lane: 1.70 risk (327 cases)</li>
                  <li>• Total: 500 cases</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-pink-400">Female Driver Patterns</h4>
                <ul className="text-sm space-y-1">
                  <li>• Vehicle-Driver Critical: 2.42 risk (19 cases)</li>
                  <li>• Intersection Secondary: 1.82 risk (22 cases)</li>
                  <li>• Total: 41 cases</li>
                  <li>• Higher severity, lower frequency</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-400">Key Insights</h4>
                <ul className="text-sm space-y-1">
                  <li>• Highest risk: Vehicle-Driver Critical (2.42)</li>
                  <li>• Most frequent: Vehicle-Lane (327 cases)</li>
                  <li>• Males: Higher frequency overall</li>
                  <li>• Females: Higher severity when accidents occur</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
