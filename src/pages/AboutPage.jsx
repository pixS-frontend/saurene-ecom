export default function AboutPage() {
  return (
    <div className="container-pad section-space">
      <h1 className="font-heading text-4xl text-brand-wine sm:text-5xl">About Saurene</h1>
      <div className="mt-6 max-w-3xl rounded-3xl bg-white p-8 leading-8 text-brand-charcoal/80 shadow-sm">
        <p>
          Saurene is a truly homegrown fashion brand built with intention, patience, and care.
          Each piece is designed to feel calm yet confident - elegant without being loud.
        </p>
        <p className="mt-4">
          Inspired by vintage femininity and timeless silhouettes, Saurene blends old-world grace
          with a modern spirit. Our designs are created thoughtfully and with respect for the
          hands that make them.
        </p>
        <p className="mt-4">
          At Saurene, the process matters as much as the outcome. From mindful sourcing to humane
          working hours, every step is guided by positive energy and purpose - because what’s
          created with care is felt when worn.
        </p>
        <p className="mt-4">This is clothing for days you choose yourself.</p>
        <p>For moments without rush.</p>
        <p>For elegance that feels personal.</p>
        <p className="mt-4">We focus on:</p>
        <ul className="list-disc pl-6">
          <li>intentional creation</li>
          <li>thoughtful fabrics</li>
          <li>humane production</li>
          <li>slow, considered design</li>
        </ul>
        <h2 className="mt-6 font-heading text-3xl text-brand-wine">Sustainability</h2>
        <p className="mt-2">
          At Saurene, sustainability means mindful production, respectful timelines, and positive
          energy at every step. Our garments are crafted with minimal waste, thoughtful material
          selection, and a focus on long-lasting quality — because fashion should enrich lives, not
          exhaust resources.
        </p>
      </div>
    </div>
  );
}
