import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { isClientError } from './api/client'
import { AppLayout, RouteErrorPage } from './app/AppLayout'
import { NotFoundPage } from './app/NotFoundPage'
import { EditBufferProvider } from './features/resources/edit-buffer/EditBufferProvider'
import { ResourceLayout } from './features/resources/components/ResourceLayout'
import { BasicInfoPage } from './features/resources/pages/BasicInfoPage'
import { ProjectDetailsPage } from './features/resources/pages/ProjectDetailsPage'
import { ResourceDetailsPage } from './features/resources/pages/ResourceDetailsPage'
import { ResourceOverviewPage } from './features/resources/pages/ResourceOverviewPage'
import { ResourcesListPage } from './features/resources/pages/ResourcesListPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 4xx answers (bad id, not found) won't change on retry.
      retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/resources" replace /> },
      { path: 'resources', element: <ResourcesListPage /> },
      {
        path: 'resources/:resourceId',
        element: <ResourceLayout />,
        children: [
          { index: true, element: <ResourceOverviewPage /> },
          { path: 'details', element: <ResourceDetailsPage /> },
          { path: 'basic-info', element: <BasicInfoPage /> },
          { path: 'project-details', element: <ProjectDetailsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EditBufferProvider>
        <RouterProvider router={router} />
      </EditBufferProvider>
    </QueryClientProvider>
  )
}

export default App
