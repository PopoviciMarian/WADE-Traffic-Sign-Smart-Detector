"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { OntologyData } from "@/models/Ontology"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

interface FrameDescriptionProps {
  isLoading: boolean
  ontologyData: OntologyData[]
}

export function FrameDescription({ isLoading, ontologyData }: FrameDescriptionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Frame Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-24 mb-4" />
          <Skeleton className="w-full h-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frame Description</CardTitle>
      </CardHeader>
      <CardContent>
        {ontologyData.length === 0 ? (
          <p className="text-muted-foreground">No detections in this frame.</p>
        ) : (
          <div className="space-y-6">
            {ontologyData.map((data, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-shrink-0 w-24 h-24 relative">
                  <Image
                   src={`/signs/${data.id}.png`}
                    alt={data.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-2">{data.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{data.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {data.type}
                    </div>
                    <div>
                      <span className="font-medium">Shape:</span> {data.shape}
                    </div>
                    <div>
                      <span className="font-medium">Color:</span> {data.color}
                    </div>
                    <div>
                      <span className="font-medium">ID:</span> {data.id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
