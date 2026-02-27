
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Dashboard from './pages/dashboard/Dashboard';
import TreeViewer from './pages/tree-viewer/TreeViewer';
import CreateTree from './pages/create-tree/CreateTree';
import TreeEditor from './pages/tree-editor/TreeEditor';
import Extension from './pages/formExtension/FormExtension';

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
    path: '/create-tree',
    element: <CreateTree />, 
  },
  {
    path: '/tree-editor/:treeId',
    element: <TreeEditor />, 
  },
  {
    path: 'extend-family-tree/:treeId',
    element: <Extension />,
  },
];

export default routes;
