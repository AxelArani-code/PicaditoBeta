import Link from "next/link";
import { MapPin } from "lucide-react";
import { Container, Card, H2, H4, Body } from "../design-system";

interface VenuesListProps {
    venues: any[];
}

export const VenuesList = ({ venues }: VenuesListProps) => {
    if (venues.length === 0) return null;

    return (
        <section className="py-12 pb-24 border-t border-border">
            <Container>
                <H2 className="mb-10 text-center text-text-primary">Canchas destacadas</H2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {venues.slice(0, 6).map((venue: any) => (
                        <Link key={venue.id} href={`/canchas/${venue.slug}`}>
                            <Card hoverable className="h-full">
                                <div className="mb-3 flex items-center justify-between">
                                    <H4 className="text-text-primary">{venue.name}</H4>
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                </div>
                                <p className="flex items-center gap-1.5 text-small text-text-secondary">
                                    <MapPin className="h-4 w-4" /> {venue.city}
                                </p>
                                <div className="mt-4 pt-4 border-t border-border">
                                    <Body className="text-xs text-text-secondary">
                                        {(venue.pitches as any)?.[0]?.count ?? 0} canchas disponibles
                                    </Body>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    );
};
