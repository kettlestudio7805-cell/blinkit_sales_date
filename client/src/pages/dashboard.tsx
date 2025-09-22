import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { FileUpload } from "@/components/FileUpload";
import { FiltersSection } from "@/components/FiltersSection";
import { MetricsOverview } from "@/components/MetricsOverview";
import { ChartsSection } from "@/components/ChartsSection";
import { DataTable } from "@/components/DataTable";
import { useQuery } from "@tanstack/react-query";
import type { ActiveFilters } from "@/types/dashboard";
import type { SalesData } from "@shared/schema";

export default function Dashboard() {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  const { data: salesData } = useQuery<SalesData[]>({
    queryKey: ['/api/sales'],
  });

  const hasData = salesData && salesData.length > 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {!hasData && (
            <FileUpload onUploadSuccess={() => {
              // Data will be automatically refreshed by React Query
            }} />
          )}

          {hasData && (
            <>
              <FiltersSection
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
              />
              
              <MetricsOverview filters={activeFilters} />
              
              <div className="mb-6">
                <ChartsSection filters={activeFilters} />
              </div>
              
              <DataTable filters={activeFilters} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
