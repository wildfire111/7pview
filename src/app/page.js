"use client";
import { Button } from "@heroui/react";

export default function Page() {
  return (
    <main className="p-8 space-y-6">
      <section>
        <h2>Plain HTML button:</h2>
        <button>Click me</button>
      </section>

      <section>
        <h2>HeroUI Button:</h2>
        <Button color="primary" radius="lg" shadow>
          Click me
        </Button>
      </section>
    </main>
  );
}
