"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VideoTabsProps {
  activeTab: "frames" | "video"
  onTabChange: (tab: "frames" | "video") => void
}

export function VideoTabs({ activeTab, onTabChange }: VideoTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "frames" | "video")}>
      <TabsList className="w-full justify-start">
        <TabsTrigger value="frames">Processed Frames</TabsTrigger>
        <TabsTrigger value="video">Original Video</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}