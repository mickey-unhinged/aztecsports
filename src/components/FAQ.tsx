import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "How do I become a member?",
      answer: "You can become a member by selecting a membership plan on our website and completing the registration process. Once registered, you'll have access to all member benefits including training sessions and exclusive events."
    },
    {
      question: "What are the training schedules?",
      answer: "Training sessions are held throughout the week at various times. Members can view and book available training slots through their dashboard. Check the training schedule section for specific times and locations."
    },
    {
      question: "Can I cancel my membership?",
      answer: "Yes, you can cancel your membership at any time. Please note that cancellations are processed at the end of your current billing cycle, and no refunds are provided for partial months."
    },
    {
      question: "Do you offer trial sessions?",
      answer: "Yes! We offer trial sessions for new members. Contact us through the contact form or reach out via phone or email to schedule your free trial session."
    },
    {
      question: "What equipment do I need?",
      answer: "For most training sessions, you'll need comfortable athletic wear, proper sports shoes, and a water bottle. Specific equipment requirements will be listed in the training session details."
    },
    {
      question: "Are there age restrictions?",
      answer: "We welcome members of all ages! We have programs tailored for different age groups and skill levels. Contact us to find the best program for you or your child."
    },
    {
      question: "How do I book a training session?",
      answer: "Once you're a member, you can book training sessions directly from your dashboard. Navigate to the Training Schedule section, select an available slot, and confirm your booking."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards through our secure Stripe payment gateway. All transactions are encrypted and secure."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Got questions? We've got answers.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass-card px-6 rounded-lg border-0"
              >
                <AccordionTrigger className="text-left hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
