import { AIChat } from './AIChat';

export const ChatShowcase = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Experience AI-Powered
              <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Conversations
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Try our intelligent assistant right now. Ask anything and see the power of advanced AI in action.
            </p>
          </div>

          {/* Chat Component */}
          <div className="max-w-3xl mx-auto">
            <AIChat />
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border">
              <div className="text-3xl font-bold text-primary mb-2">&lt;100ms</div>
              <div className="text-sm text-muted-foreground">Average Response Time</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border">
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Languages Supported</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
