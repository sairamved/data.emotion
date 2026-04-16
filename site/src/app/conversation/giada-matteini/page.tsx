import { ConversationLayout } from "@/components/ConversationLayout";

export default function GiadaMatteiniPage() {
  return (
    <ConversationLayout
      name="Giada Matteini"
      audioUrl="/audio/Giada.mp3"
    >
      <section>
        <p
          style={{
            color: "rgba(255, 255, 248, 0.25)",
            fontFamily: '"Manrope", sans-serif',
            fontSize: "0.95rem",
            fontStyle: "italic",
            marginTop: "3rem",
          }}
        >
          Coming soon.
        </p>
      </section>
    </ConversationLayout>
  );
}
