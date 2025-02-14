import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Signup from '../Signup'
import Login from '../Login'
import Home from '../Home'
import ForgotPassword from './ForgotPassword'
import ResetPassword from '../ResetPassword'
function App() {


  return (
    <>
     <BrowserRouter>
     <Routes>
      <Route path='/' element={<Signup />}></Route>
      <Route path='/login' element={<Login />}></Route>
      <Route path='/home' element={<Home />}></Route>
      <Route path='/forgotPassword' element={<ForgotPassword />}></Route>
      <Route path='/reset-password/:token' element={<ResetPassword />}></Route>

     </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
