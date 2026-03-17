import { Container, Body } from "../../design-system";

export const Footer = () => {
    return (
        <footer className="border-t border-border py-12 bg-surface">
            <Container className="text-center">
                <Body className="text-small text-text-secondary">
                    © 2026 Picadito · Fútbol amateur en Argentina
                </Body>
            </Container>
        </footer>
    );
};
