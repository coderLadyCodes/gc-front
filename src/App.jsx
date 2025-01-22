import { createBrowserRouter, Outlet, RouterProvider} from 'react-router-dom'
import Login from './components/authentication/Login'
import AuthProvider, { useAuth } from './components/authentication/AuthProvider'
import Home from './components/common/Home'
import Dashboard from './components/common/Dashboard'
import ErrorPage from './components/common/ErrorPage'
import Logout from './components/authentication/Logout'
import UserProfile from './components/user/UserProfile'
import AddClient from './components/client/AddClient'
import ClientsList from './components/client/ClientsList'
import Client from './components/client/Client'
import ClientProvider from './components/client/ClientProvider'
import ProductCategory from './components/product/ProductCategory'
import Categories from './components/product/Categories'
import AddProduct from './components/product/AddProduct'
import AddCategory from './components/product/AddCategory'
import ProductCategoryProvider from './components/product/ProductCategoryProvider'
import ProductDetail from './components/product/ProductDetail'
import AddCare from './components/programCares/AddCare'
import { ProductProvider } from './components/product/ProductProvider'
import Programs from './components/programCares/Programs'
import Planning from './components/programCares/Planning'
import ProgramPreviewModal from './components/programCares/ProgramPreviewModal '
import { ThemeProvider } from './components/common/ThemeProvider'
import PrivateRoutes from './components/authentication/PrivateRoutes'
import Unauthorized from './components/authentication/Unauthorized'

const DashboardWithProviders = () => (
  <ClientProvider>
    <ProductProvider>
    <Dashboard />
    </ProductProvider>
  </ClientProvider>
)

const ProductCategoryWrapper = () => {
  return (
    <ProductCategoryProvider>
      <Outlet />
    </ProductCategoryProvider>
  )
}
const AddCareProgramsWrapper = () => {
  return (
    <div>
      <AddCare />
      <Programs />
    </div>
  )
}


const AuthLayout = () => (
  <AuthProvider>
    <ThemeProvider>
    <Outlet /> 
    </ThemeProvider>
  </AuthProvider>
  
)

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/', element: <Home />, errorElement: <ErrorPage /> },
      { path: '/login', element: <Login />, errorElement: <ErrorPage /> },
      { path: '/unauthorized', element: <Unauthorized />, errorElement: <ErrorPage /> },
      { path: '/logout', element: <Logout />, errorElement: <ErrorPage /> },
      {
        path: '/dashboard',
        element: <PrivateRoutes allowedRoles={['ADMIN', 'USER']} />,
        children: [
          {
            path: '',
            element: <DashboardWithProviders />,
            errorElement: <ErrorPage />,
            children: [
              { path: 'user-profile', element: <UserProfile />, errorElement: <ErrorPage /> },
              { path: 'add-client', element: <AddClient />, errorElement: <ErrorPage /> },
              { path: 'clients', element: <ClientsList />, errorElement: <ErrorPage /> },
              {
                path: 'client/:clientId',
                element: <Client />,
                errorElement: <ErrorPage />,
                children: [
                  { path: 'add-care', element: <AddCareProgramsWrapper />, errorElement: <ErrorPage /> },
                  {
                    path: 'planning/:programId',
                    element: <Planning />,
                    errorElement: <ErrorPage />,
                    children: [
                      { path: 'preview', element: <ProgramPreviewModal />, errorElement: <ErrorPage /> },
                    ],
                  },
                ],
              },
              { path: 'product-category', element: <ProductCategory />, errorElement: <ErrorPage /> },
              { path: 'add-category', element: <AddCategory />, errorElement: <ErrorPage /> },
              {
                path: 'add-product',
                element: <ProductCategoryWrapper />,
                children: [{ path: '', element: <AddProduct />, errorElement: <ErrorPage /> }],
                errorElement: <ErrorPage />,
              },
              {
                path: 'categories',
                element: <ProductCategoryWrapper />,
                children: [{ path: '', element: <Categories />, errorElement: <ErrorPage /> }],
                errorElement: <ErrorPage />,
              },
              {
                path: 'product-detail/:id',
                element: <ProductCategoryWrapper />,
                children: [{ path: '', element: <ProductDetail />, errorElement: <ErrorPage /> }],
              },
            ],
          },
        ],
      },
    ],
  },
]);
function App(){
  return (
      <RouterProvider router={router}/>
  )
}

export default App