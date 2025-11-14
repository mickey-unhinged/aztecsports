export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-2xl font-bold text-primary mb-2">Aztec Sports</h3>
            <p className="text-muted-foreground">Building champions since 2024</p>
          </div>
          <div className="text-center md:text-right text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Aztec Sports. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
