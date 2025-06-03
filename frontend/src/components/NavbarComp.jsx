import { Fragment, useRef } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { handleArrowKeyNavigation } from '../utils/focusManagement'

const navigation = [
  { name: 'Portfolio', href: '/', current: true },
  { name: 'ML', href: '#', current: false },
  { name: 'Visualización', href: '/visualizacion', current: false },
  { name: 'Fundamental', href: '/fundamental', current: false },
  { name: 'Backtesting', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const navigationRef = useRef(null);
  const mobileNavigationRef = useRef(null);

  const handleKeyDown = (e, isMobile = false) => {
    const container = isMobile ? mobileNavigationRef.current : navigationRef.current;
    if (container) {
      handleArrowKeyNavigation(e, container, {
        itemSelector: 'a[role="menuitem"]',
        orientation: isMobile ? 'vertical' : 'horizontal',
        loop: true
      });
    }
  };

  return (
    <Disclosure as="nav" className="bg-gray-800" role="navigation" aria-label="Navegación principal">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button 
                  className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  aria-label={open ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                  aria-expanded={open}
                  aria-controls="mobile-menu"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">{open ? "Cerrar" : "Abrir"} menú principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                    alt="Logotipo de la aplicación financiera"
                  />
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div 
                    ref={navigationRef}
                    className="flex space-x-4"
                    role="menubar"
                    aria-label="Navegación principal"
                    onKeyDown={(e) => handleKeyDown(e, false)}
                  >
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
                        )}
                        role="menuitem"
                        aria-current={item.current ? 'page' : undefined}
                        tabIndex={item.current ? 0 : -1}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  aria-label="Ver notificaciones"
                  aria-describedby="notifications-desc"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Ver notificaciones</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                <span id="notifications-desc" className="sr-only">
                  Botón para acceder a notificaciones y alertas del sistema
                </span>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button 
                      className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      aria-label="Abrir menú de usuario"
                      aria-haspopup="true"
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Abrir menú de usuario</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Foto de perfil del usuario"
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items 
                      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 focus:outline-none focus:bg-gray-100')}
                            role="menuitem"
                            aria-label="Ver y editar perfil de usuario"
                          >
                            Perfil
                          </a>
                        )}
                      </Menu.Item>
                     
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="/logout"
                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 focus:outline-none focus:bg-gray-100')}
                            role="menuitem"
                            aria-label="Cerrar sesión y salir de la aplicación"
                          >
                            Cerrar Sesión
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel 
            className="sm:hidden"
            id="mobile-menu"
            role="menu"
            aria-label="Navegación móvil"
          >
            <div 
              ref={mobileNavigationRef}
              className="space-y-1 px-2 pb-3 pt-2"
              onKeyDown={(e) => handleKeyDown(e, true)}
            >
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
                  )}
                  role="menuitem"
                  aria-current={item.current ? 'page' : undefined}
                  tabIndex={item.current ? 0 : -1}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}