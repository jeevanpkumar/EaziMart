import { Link, useLocation } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import SearchBar from "./SearchBar";
import { useState } from "react";
import CartDrawer from "../Layout/CartDrawer";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";



const NavBar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [navDrawer, setNavDrawer] = useState(false);

  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);


  const hiddenPaths = ["/login", "/register", "/forgot-password", "/onboarding"];
  if (hiddenPaths.includes(location.pathname)) return null;

  const isHomePage = location.pathname === "/";



  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleNavDrawer = () => {
    setNavDrawer(!navDrawer);
  };

 
  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) ||
    0;

  return (
    <div
      className={`my-2 ${isHomePage ? "fixed" : "absolute"
        } z-10 top-10 inset-x-4 md:inset-x-10 mx-auto rounded-xl bg-white/80 shadow-md shadow-black max-w-4xl`}
    >
      <nav className="flex items-center justify-between py-1 px-6 md:px-12">
      
        <div>
          <Link to="/" className="text-2xl font-medium">
            
          EaziMArt

          </Link>
        </div>
       
        <div className="hidden md:flex space-x-6">
          <Link
            to="/collections/all?gender=Men"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Men
          </Link>
          <Link
            to="/collections/all?gender=Women"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Women
          </Link>
          <Link
            to="/collections/all?category=Top Wear"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Top Wear
          </Link>
          <Link
            to="/collections/all?category=Bottom Wear"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Bottom Wear
          </Link>
        </div>
      
        <div className="flex items-center justify-between gap-3">
          {user?.role === "admin" && (
          <Link
              to="/admin"
              className="hidden md:block bg-rabbit-red text-white text-xs items-center rounded font-semibold hover:hover:bg-rabbit-red/90 px-2 py-1 transition-all duration-400" >
              ADMIN
            </Link>
            )}
          <Link to="/profile" className="hover:text-black">
            <HiOutlineUser className="h-5 w-5 md:h-6 md:w-6 text-zinc-700" />
          </Link>
          <button onClick={toggleDrawer} className="relative hover:text-black">
  <HiOutlineShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-zinc-700" />
  {cartItemCount > 0 && (
    <span className="absolute bg-red-600 text-white text-[0.6rem] rounded-full px-1 md:px-1.5 md:py-0.5 -top-1 right--2">
      {cartItemCount}
    </span>
  )}
</button>

         
          <SearchBar />
          <button onClick={toggleNavDrawer} className="md:hidden">
            <HiBars3BottomRight className="h-5 w-5 md:h-6 md:w-6 text-zinc-700" />
          </button>
        </div>
       
       <CartDrawer drawerOpen={isDrawerOpen} toggleCartDrawer={toggleDrawer} />


      
        <div
          className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 flex flex-col z-50 ${navDrawer ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex justify-between p-4">
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="fixed flex bottom-5 left-5 right-5 md:hidden  bg-rabbit-red shadow-md shadow-black  text-white items-center justify-center rounded-lg font-semibold hover:bg-rabbit-red/90 tracking-tighter px-2 py-3 transition-all duration-400"
              >
                GO TO ADMIN DASHBOARD
              </Link>
            )}
            <button
              onClick={toggleNavDrawer}
              className="text-gray-700 hover:text-black"
            >
              <IoMdClose className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Menu</h2>
            <nav className="flex flex-col space-y-4">
              <Link
                to="/collections/all?gender=Men"
                onClick={toggleNavDrawer}
                className="text-gray-700 block hover:text-black text-sm font-medium uppercase"
              >
                Men
              </Link>
              <Link
                to="/collections/all?gender=Women"
                onClick={toggleNavDrawer}
                className="text-gray-700 block hover:text-black text-sm font-medium uppercase"
              >
                Women
              </Link>
              <Link
                to="/collections/all?category=Top Wear"
                onClick={toggleNavDrawer}
                className="text-gray-700 block hover:text-black text-sm font-medium uppercase"
              >
                Top Wear
              </Link>
              <Link
                to="/collections/all?category=Bottom Wear"
                onClick={toggleNavDrawer}
                className="text-gray-700 block hover:text-black text-sm font-medium uppercase"
              >
                Bottom Wear
              </Link>
            </nav>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;