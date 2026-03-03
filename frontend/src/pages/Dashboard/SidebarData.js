import React from 'react';
// Importing icons from the FontAwesome (fa) pack within react-icons
import { 
  FaEye, 
  FaHeart, 
  FaBell, 
  FaLightbulb, 
  FaBriefcase, 
  FaFire, 
  FaIndustry, 
  FaSitemap, 
  FaLandmark, 
  FaGift, 
  FaCoins,
  FaFolder,
} from 'react-icons/fa';
import { RxHamburgerMenu } from "react-icons/rx";

export const SidebarData = [
    {
        title: 'Select a list', 
        icon: <RxHamburgerMenu />, // Usually no icon for a header/selector
        path: "#"
    },
    {
        title: 'Recents', 
        icon: <FaEye />, 
        path: "recents",
        subItems : ["RecentItem1","RecentItem2", "RecentItem3"]

    },
    {
        title: 'Favorites', 
        icon: <FaHeart />, 
        path: "favorites",
        subItems : ["FavoriteItem1","FavoriteItem2", "FavoriteItem3"]
    },
    {
        title: 'Email Enabled', 
        icon: <FaBell />, // Matches the bell icon in your image
        path: "emailenabled",
        subItems : ["Item1","Item2", "Item3"]
    },
    {
        title: 'Watchlists', 
        icon: <FaLightbulb />, 
        path: "watchlists",
        subItems : ["List1","List2", "List3"]
    },
    {
        title: 'My Portfolios', 
        icon: <FaBriefcase />, 
        path: "myportfolios",
        subItems : ["Item1","Item2", "Item3"]
    },
    {
        title: 'Chaikin Hotlists', 
        icon: <FaFire />, 
        path: "chaikinhotlists",
        subItems : ["Item1","Item2", "Item3"]
    },
    {
        title: 'Industries', 
        icon: <FaIndustry />, 
        path: "industries" ,
        subItems : ["Item1","Item2", "Item3"]
    },
    {
        title: 'Sector', 
        icon: <FaSitemap />, 
        path: "sector",
        subItems : ["Item1","Item2", "Item3"]
    },
    {
        title: 'Indexes', 
        icon: <FaLandmark />, 
        path: "indexes",
        subItems : ["Item1","Item2", "Item3"]
    },
    {
        title: 'Publications', 
        icon: <FaFolder />, // Reused briefcase, or try <FaFolder /> if you prefer
        path: "publications",
        subItems : ["Item1P","Item2", "Item3"]
    },
    {
        title: 'Publication Bonus', 
        icon: <FaGift />, 
        path: "publicationbonus",
        subItems : ["Item1","Item2", "Item3"]
    },
    {
        title: 'US Equity ETFs', 
        icon: <FaCoins />, 
        path: "usequityetfs",
        subItems : ["Item1","Item2", "Item3"]
    },
];

