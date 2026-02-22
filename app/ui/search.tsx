'use client'; // componente de cliente.

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams =  useSearchParams(); // esto devuelve los parametros que hay en la URL como dic clave valor
  const pathname = usePathname();
  const { replace } = useRouter();


  const handleSearch = useDebouncedCallback((term)  => { // Usamos esto para no estar haciendo requests cadda vez que el usuario pulsa una tecla
    const params = new URLSearchParams(searchParams)
    console.log(`Searching... ${term}`);
    params.set('page', '1')
    if (term) {
      params.set('query', term) // creamos un parametro que se llama query con el valor de term
    }  else {
      params.delete('query')
    }
    replace(`${pathname}?${params.toString()}`)  // Aqui estamos construyendo el nuevo pathname y luego remplazandolo gracias al hook de useRouter de next
  }, 300)


  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e)  => {
            handleSearch(e.target.value)
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
