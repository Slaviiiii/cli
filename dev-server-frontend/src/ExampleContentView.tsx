import { useQuery } from "react-query"
import { useGlobalStore } from "./hooks/use-global-store"
import axios from "axios"
import { Schematic } from "@tscircuit/schematic-viewer"
import { PCBViewer } from "@tscircuit/pcb-viewer"
import { cn } from "./lib/utils"

export const ExampleContentView = () => {
  const devExamplePackageId = useGlobalStore(
    (s) => s.active_dev_example_package_id
  )

  const {
    data: pkg,
    error,
    isError,
    isLoading,
  } = useQuery(
    ["dev_package_example", devExamplePackageId],
    async () =>
      axios
        .post(`/api/dev_package_examples/get`, {
          dev_package_example_id: devExamplePackageId,
        })
        .then((r) => r.data.dev_package_example),
    {
      refetchIntervalInBackground: true,
      retry: false,
    }
  )

  const notFound = (error as any)?.response?.status === 404

  const viewMode = useGlobalStore((s) => s.view_mode)
  const splitMode = useGlobalStore((s) => s.split_mode)

  const editorHeight = window.innerHeight - 52
  const halfHeight = Math.floor(editorHeight / 2)

  const itemHeight =
    viewMode === "split" && splitMode === "vertical" ? halfHeight : editorHeight

  return (
    <div
      key={pkg?.last_updated_at}
      className={cn(
        "relative",
        `h-[${editorHeight}px]`,
        viewMode === "split" &&
          splitMode === "horizontal" &&
          "grid grid-cols-2",
        viewMode === "split" && splitMode === "vertical" && "grid grid-rows-2"
      )}
    >
      {notFound && (
        <div className="absolute top-0 w-full flex justify-center">
          <div className="bg-yellow-50 shadow-lg p-4 m-16 border-yellow-200 border rounded-lg whitespace-pre max-w-[400px]">
            Select an example from the menu above
          </div>
        </div>
      )}
      {isLoading && !isError && (
        <div className="absolute top-0 w-full flex justify-center">
          <div className="bg-gray-50 shadow-lg p-4 m-16 border-gray-200 border rounded-lg whitespace-pre">
            Loading...
          </div>
        </div>
      )}
      {pkg && (viewMode === "schematic" || viewMode === "split") && (
        <Schematic
          key={pkg?.last_updated_at}
          style={{ height: itemHeight }}
          soup={pkg.tscircuit_soup}
          showTable={false}
        />
      )}
      {pkg && (viewMode === "pcb" || viewMode === "split") && (
        <PCBViewer
          key={pkg?.last_updated_at}
          height={itemHeight}
          soup={pkg.tscircuit_soup}
        />
      )}
      {pkg?.error && (
        <div className="absolute top-0 w-full">
          <div className="bg-red-50 shadow-lg p-4 m-16 border-red-200 border rounded-lg whitespace-pre">
            {pkg?.error}
          </div>
        </div>
      )}
    </div>
  )
}
