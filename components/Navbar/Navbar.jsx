"use client";

import { useEffect, useState } from "react";
import GlassSurface from "../ui/GlassSurface";
import Image from "next/image";

export default function Navbar() {
  const [active, setActive] = useState(false);

  const menu = [
    {
      name: "Home",
      link: "#home",
    },
    {
      name: "About",
      link: "#about",
    },
    {
      name: "Why us",
      link: "#why",
    },
    {
      name: "Faq",
      link: "#faq",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];
  useEffect(() => {
    const handleScroll = () => setActive(window.scrollY >= 50);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const Wrapper = active ? GlassSurface : "div";

  return (
    <div
      className={`fixed top-[-12] left-1/2 -translate-x-1/2 z-[120]  transition-all duration-500 ${
        active ? "w-[70%] p-5 top-0" : "w-full"
      }`}
    >
      <Wrapper
        {...(active && {
          width: "100%",
          height: 76,
          borderRadius: 38,
          distortionScale: -180,
          displace: 0.5,
          backgroundOpacity: 0.1,
        })}
      >
        <div className="flex w-full items-center justify-between p-[20px] text-white transition-all duration-200 z-[1200] justify-between">
          <div>
            <Image src="/logo.png" alt="Logo" width={200} height={60} />
          </div>
          <div className="flex gap-[20px]">
            {menu.map((i, index) => {
              return (
                <a key={index} href={i.link}>
                  {i.name}
                </a>
              );
            })}
          </div>
        </div>
      </Wrapper>
    </div>
  );
}
