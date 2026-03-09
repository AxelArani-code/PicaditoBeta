import { Calendar, LayoutDashboard, Target } from "lucide-react";
import { Container, Card, H3, Body } from "../../design-system";

const features = [
    { icon: <Calendar className="h-8 w-8 text-primary" />, title: "Reservas en tiempo real", desc: "Seleccioná el horario y reservá al instante. El dueño confirma en minutos." },
    { icon: <LayoutDashboard className="h-8 w-8 text-primary" />, title: "Historial de partidos", desc: "Registrá goles, asistencias y el MVP de cada partido. Construí tu legado." },
    { icon: <Target className="h-8 w-8 text-primary" />, title: "Ranking de jugadores", desc: "Competí por los primeros puestos del ranking de la comunidad." },
];

export const Features = () => {
    return (
        <section className="py-20">
            <Container>
                <div className="grid gap-8 sm:grid-cols-3">
                    {features.map((feature) => (
                        <Card key={feature.title} hoverable className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-green-50">
                                {feature.icon}
                            </div>
                            <H3 className="mb-2 text-text-primary">{feature.title}</H3>
                            <Body className="text-sm text-text-secondary">{feature.desc}</Body>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    );
};
