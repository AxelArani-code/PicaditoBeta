import { Container, Card, Button } from "../../design-system";

const features = [
    {
        image: "/calendar.png",
        title: "Más reservas",
        desc: "Los jugadores encuentran y reservan fácil."
    },
    {
        image: "/calendar.png",
        title: "Horarios sin conflictos",
        desc: "Control total de disponibilidad."
    },
    {
        image: "/renking.png",
        title: "Control de ingresos",
        desc: "Visualizá pagos y ganancias."
    },
    {
        image: "/rendimiento.png",
        title: "Torneos automáticos",
        desc: "Organiza ligas en minutos."
    },
];

export const Features = () => {
    return (
        <section className="py-20">
            <Container>
                {/* Title */}
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-black md:text-4xl lg:text-5xl">
                        Beneficios
                    </h2>
                </div>

                {/* Features Grid */}
                <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4  ">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group rounded-xl border bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900  border-white/10 bg-white/5 px-6 py-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-white/10 hover:shadow-lg hover:shadow-primary/20"
                        >
                            <div className="mb-4 flex h-36 w-36 items-center justify-center rounded-lg bg-primary/20 transition-all duration-300 group-hover:bg-primary/30 sm:h-20 sm:w-20 md:h-24 md:w-24">
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="h-30 w-30 object-contain sm:h-32 sm:w-32 md:h-24 md:w-24 lg:h-36 lg:w-36"
                                />
                            </div>
                            <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                            <p className="text-sm text-white/70">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="relative overflow-hidden rounded-2xl bg-[#1a4d3a] px-8 py-16 text-white md:px-12 md:py-20">
                    <div className="flex items-center justify-between gap-8">
                        <div>
                            <h2 className="mb-2 text-3xl font-bold leading-tight md:text-4xl">
                                Empezá a gestionar<br />
                                tu cancha hoy
                            </h2>
                            <p className="text-base text-white/80">
                                Todo en un solo lugar.
                            </p>
                        </div>
                        <Button className="whitespace-nowrap bg-white text-[#1a4d3a] hover:bg-white/90">
                            Registrar mi cancha →
                        </Button>
                    </div>
                </div>
            </Container>
        </section>
    );
};
