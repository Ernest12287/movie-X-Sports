export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-bold neon-text mb-2">Ernest Palace</h3>
            <p className="text-sm text-muted-foreground">
              Your ultimate destination for movies and live sports streaming
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold mb-2 text-foreground">Credits</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Creator: <span className="text-neon-pink">Pease Ernest</span></p>
              <p>Developed by: <span className="text-neon-purple">lovable.dev + Pease Ernest</span></p>
              <p>Programmer: <span className="text-neon-cyan">Blessings Amiani</span> (Ernest Tech House)</p>
              <a 
                href="https://t.me/ernesttechhouse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-neon-pink hover:underline mt-2"
              >
                Telegram: @ernesttechhouse
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border/30 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ernest Palace. Made with ❤️ by Ernest Tech House
        </div>
      </div>
    </footer>
  );
};
