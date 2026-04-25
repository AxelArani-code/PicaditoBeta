import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

export const Modal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    return (
         <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Términos y Condiciones</h2>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">SaaS Service Agreement v2.4</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              <section className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  1. Aceptación del Servicio
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bienvenido a <span className="text-white font-bold italic">PICADITO STADIUM</span>. Al registrar su complejo deportivo en nuestra plataforma, usted acepta estar legalmente vinculado por estos términos. Nuestra arquitectura SaaS está diseñada para optimizar su gestión, pero requiere el uso responsable de las herramientas proporcionadas.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  2. Gestión de Reservas y Pagos
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Picadito actúa como un motor de intermediación técnica. Los administradores del complejo son responsables de:
                </p>
                <ul className="text-slate-400 text-sm space-y-2 list-disc pl-5">
                  <li>Validar la disponibilidad real de las canchas físicas.</li>
                  <li>Configurar correctamente los gateways de pago (Mercado Pago, Stripe, etc.).</li>
                  <li>Gestionar las cancelaciones y reembolsos según sus políticas internas.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  3. Privacidad y Datos (GDPR/LPDP)
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Nos tomamos la seguridad de los datos con rigor técnico. Midnight Pitch encripta la información de sus clientes, pero no se hace responsable del mal uso de las credenciales por parte del personal del complejo deportivo. El uso de "Real-Time Analytics" implica el procesamiento de datos anónimos para mejorar el rendimiento global del sistema.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  4. Disponibilidad del Sistema (SLA)
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Garantizamos un uptime del 99.9% en nuestra infraestructura cloud. Sin embargo, no somos responsables por fallos en las conexiones locales de internet de los complejos o interrupciones en los servicios de terceros como mapas o pasarelas de pago externas.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  5. Terminación de Cuenta
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Picadito se reserva el derecho de suspender el acceso a complejos que presenten actividades fraudulentas o patrones de reserva sospechosos que comprometan la estabilidad de la red.
                </p>
              </section>
            </div>

            {/* Footer Action */}
            <div className="p-8 border-t border-white/5 bg-slate-900/50">
              <button 
                onClick={onClose}
                className="w-full bg-primary text-[#1a1a1a] py-4 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20"
              >
                Entendido, continuar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    )
}