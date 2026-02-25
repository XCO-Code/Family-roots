
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Dashboard from './pages/dashboard/Dashboard';
import TreeViewer from './pages/tree-viewer/TreeViewer';
import Extension from './pages/extension/Extension';

const routes = [
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/tree-viewer/:treeId',
    element: <TreeViewer />,
  },
  {
    path: '/extension',
    element: <Extension />,
  },
];

export default routes;
