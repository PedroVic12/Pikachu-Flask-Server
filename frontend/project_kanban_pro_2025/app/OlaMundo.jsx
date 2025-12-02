'use client';

import React from 'react';


// Cria um componente H1 com estilo personalizado
function H1({ children, color, size }) {
  return (
    <h1 className={`text-${size} font-bold text-${color}`}>
      {children}
    </h1>
  );
}

// Cria um componente P com estilo personalizado
function P({ children, color }) {
  return (
    <p className={`mt-2 text-sm text-${color}`}>
      {children}
    </p>
  );
}

//! npx shadcn@latest add https://coss.com/origin/r/comp-579.json

import Logo from "@/registry/default/components/navbar-components/logo";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { active: true, href: "#", label: "Home" },
  { href: "#", label: "Features" },
  { href: "#", label: "Pricing" },
  { href: "#", label: "About" },
];


function Component() {
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 justify-between gap-4">
        {/* Left side */}
        <div className="flex gap-2">
          <div className="flex items-center md:hidden">
            {/* Mobile menu trigger */}
            <Popover>
              <PopoverTrigger asChild>
                <Button className="group size-8" size="icon" variant="ghost">
                  <svg
                    className="pointer-events-none"
                    fill="none"
                    height={16}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width={16}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="-translate-y-[7px] origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                      d="M4 12L20 12"
                    />
                    <path
                      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                      d="M4 12H20"
                    />
                    <path
                      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                      d="M4 12H20"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-36 p-1 md:hidden">
                <NavigationMenu className="max-w-none *:w-full">
                  <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem
                        className="w-full"
                        key={String(index)}
                      >
                        <NavigationMenuLink
                          active={link.active}
                          className="py-1.5"
                          href={link.href}
                        >
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          </div>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <a className="text-primary hover:text-primary/90" href="#">
              <Logo />
            </a>
            {/* Navigation menu */}
            <NavigationMenu className="h-full *:h-full max-md:hidden">
              <NavigationMenuList className="h-full gap-2">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem className="h-full" key={String(index)}>
                    <NavigationMenuLink
                      active={link.active}
                      className="h-full justify-center rounded-none border-transparent border-y-2 border-b-primary py-1.5 font-medium text-muted-foreground hover:border-b-primary hover:bg-transparent hover:text-primary data-[active]:border-b-primary data-[active]:bg-transparent!"
                      href={link.href}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button asChild className="text-sm" size="sm" variant="ghost">
            <a href="#">Sign In</a>
          </Button>
          <Button asChild className="text-sm" size="sm">
            <a href="#">Get Started</a>
          </Button>
        </div>
      </div>
    </header>
  );
}


// Este é um componente React simples.
// Ele exporta uma função que retorna um elemento JSX.
export default function OlaMundo() {
  return (
    <div className="p-8 bg-white rounded-xl shadow-md">
      <H1 color="blue-600" size="3xl">
        Olá, Mundo! 👋
      </H1>
      <P color="gray-700">
        Esta é uma nova tela que foi importada para dentro do `page.jsx`.
      </P>
      <P color="gray-500">
        Você pode criar componentes assim em arquivos separados para organizar melhor seu código.
      </P>
    </div>
  );
}
