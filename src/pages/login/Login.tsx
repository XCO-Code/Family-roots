import { User } from "lucide-react"

export default function Login(){
    return (
        <>
        <main className="w-full h-dvh flex flex-col gap-4 justify-center items-center bg-[#1d1824]">

            <div className="flex items-center justify-center h-auto text-white p-5 bg-[#391772]/70 rounded-full">
                <User size={40}/>
            </div>

            <div className="w-100 h-auto max-h-100 p-4 bg-[#251b36] rounded-2xl text-white">
                <form action="" className="w-full flex flex-col gap-4">
                    
                    
                    <div className="flex flex-col gap-1">
                        <label>Correo electronico</label>
                        <input 
                            type="text"
                            placeholder="correo electronico"
                            className="border border-purple-800 bg-[#1d1824] rounded-lg px-2 py-2"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label>Contraseña</label>
                        <input
                            type="text"
                            placeholder="Contraseña"
                            className="border border-purple-800 bg-[#1d1824] rounded-lg px-2 py-2"
                        />
                    </div>

                    <button className="w-full bg-violet-900 p-4 rounded-lg">
                        Iniciar session
                    </button>
                   
                </form>
            </div>
        </main>
        </>
    )
}