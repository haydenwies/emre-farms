import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLogOut } from '../hooks/useLogOut';
import { useAuthContext } from '../hooks/useAuthContext';

import { ArrowRightFromBracketSolid, BarsSolid, CircleUserSolid, PenToSquareSolid, RectangleListSolid, XSolid } from '../assets/Assets'

import './Nav.css'

export default function Nav() {
    const [isOpen, setIsOpen] = useState(true);

    const { logOut } = useLogOut();
    const { userType } = useAuthContext();
    const navigate = useNavigate()

    return (
        <div className={"nav"}>
            <div className="nav-items">
                <div className="toggle">
                    <img 
                        src={isOpen ? XSolid : BarsSolid} 
                        alt="" 
                        // className={"toggle"}
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </div>
                <div className="links">
                    <img 
                        src={PenToSquareSolid} 
                        alt="" 
                        className={isOpen ? "" : "disabled"}
                        style={{ animation: `${isOpen ? "moveInLeft" : "moveOutLeft"} 0.8s` }}
                        onClick={() => navigate("/order-placement")}
                    />
                    <img 
                        src={RectangleListSolid} 
                        alt="" 
                        className={isOpen ? "" : "disabled"}
                        style={{ animation: `${isOpen ? "moveInLeft" : "moveOutLeft"} 0.9s` }}
                        onClick={() => navigate("/order-overview")}
                    />
                    {userType === "admin" && (
                        <img 
                            src={CircleUserSolid} 
                            alt="" 
                            className={isOpen ? "" : "disabled"}
                            style={{ animation: `${isOpen ? "moveInLeft" : "moveOutLeft"} 1.0s` }}
                            onClick={() => navigate("/clients")}
                        />
                    )}
                </div>
                <img 
                    src={ArrowRightFromBracketSolid} 
                    alt="" 
                    className={isOpen ? "" : "disabled"}
                    style={{ animation: `${isOpen ? "moveInLeft" : "moveOutLeft"} 1.3s` }}
                    onClick={() => logOut() }
                />
            </div>
        </div>
    )
}