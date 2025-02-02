"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function VideoTabs() {
  return (
    <Tabs defaultValue="original">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="original">Original</TabsTrigger>
        <TabsTrigger value="annotated">Annotated</TabsTrigger>
        <TabsTrigger value="processed">Processed</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

