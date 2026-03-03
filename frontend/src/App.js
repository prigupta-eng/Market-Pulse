import './App.css';
import Login from './pages/Login/Login.jsx';
import Signup from './pages/Signup/Signup.jsx';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import { ToastContainer } from 'react-toastify';
function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path ='/' element = {<Navigate to = '/dashboard' replace/>}/>
          <Route path='/login' element  = {<Login/>}/>
          <Route path = '/signup' element = {<Signup/>}/>
          {/* <Route path ='/dashboard' element = {<Dashboard/>}/> */}
          {/* The "/*" tells React: "Match /dashboard AND anything that comes after it" */}
          <Route path="/dashboard/*" element={<Dashboard />} />


          
      </Routes> 
      <ToastContainer position="top-right" autoClose={3000} />

    </BrowserRouter>
    

  );
}

export default App;
