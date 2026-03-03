import React from 'react'
import './Breadcrumbs.scss'
import { Link, useLocation } from 'react-router-dom'

// Accept the activeWatchlist so we know the name!
function BreadCrumbs({ activeWatchlist }) {
    const { pathname } = useLocation()
    const pathnames = pathname.split('/').filter((x) => x)
    let breadcrumbPaths = "/dashboard"
    

  return (
    <div className='breadcrumbs'>
        <Link to='/dashboard'>Dashboard</Link>
        
        {pathnames.map((name, index) => {
            if (name.toLowerCase() === 'dashboard') return null;
            breadcrumbPaths += `/${name}`
            const isLast = index === pathnames.length - 1;

            // --- THE MAGIC TRICK ---
            // If the URL segment matches our list ID, use the list NAME instead!
            let displayName = name;
            if (activeWatchlist && activeWatchlist.id.toString() === name) {
                displayName = activeWatchlist.name;
            }

            return isLast ? (
                <span key={name}> / {displayName}</span>
            ) : (
                <span key={name}> / <Link to={breadcrumbPaths}>{displayName}</Link></span>
            )
        })}
    </div>
  )
}

export default BreadCrumbs