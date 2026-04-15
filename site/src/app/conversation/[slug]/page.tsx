import { ContentLayout } from "@/components/ContentLayout";
import { Sidenote, MarginNote } from "@/components/Sidenote";
import { notFound } from "next/navigation";

interface ConversationData {
  name: string;
  location?: string;
  date?: string;
  comingSoon?: boolean;
  sections: {
    title: string;
    content: React.ReactNode;
  }[];
}

const conversations: Record<string, ConversationData> = {
  "christian-stolte": {
    name: "Christian Stolte",
    date: "November 2025",
    sections: [
      {
        title: "On Emotional Data",
        content: (
          <>
            <p>
              <strong>What comes to mind when you think about data
              visualization and emotion?</strong>
            </p>
            <p>
              Giorgia Lupi, obviously. The data is, really, about being
              human. That&rsquo;s what she gets right. You look at her
              work and you don&rsquo;t think &ldquo;oh, interesting
              chart.&rdquo; You think about the people in it.
              <Sidenote>
                Giorgia Lupi&rsquo;s data humanism manifesto.
              </Sidenote>
            </p>
            <p>
              <strong>Does the subject of the data change how you
              think about presenting it?</strong>
            </p>
            <p>
              Yeah, of course. What is the data about? That influences the
              mode of communication too. You wouldn&rsquo;t tell a joke at a
              funeral. Same thing.
            </p>
            <p>
              If someone hands you data about refugees, and you put it in
              the same template you used for quarterly sales, something
              went wrong. The form has to respect what it&rsquo;s carrying.
            </p>
          </>
        ),
      },
      {
        title: "DNA Portraits",
        content: (
          <>
            <p>
              <strong>Your DNA Portraits work, that&rsquo;s more of an
              artistic interpretation of data. Was the goal to communicate
              information or something else?</strong>
            </p>
            <p>
              It wasn&rsquo;t really about answering a question. It was
              for getting people interested in DNA. Getting them curious
              about it. What does mine look like? What makes me different?
              <MarginNote>
                The DNA Portraits series turns individual genetic sequences
                into visual compositions.
              </MarginNote>
            </p>
            <p>
              <strong>So more like an invitation than an explanation.</strong>
            </p>
            <p>
              Exactly. And the thing is, the work ended up on a disc sent to
              the moon. I didn&rsquo;t plan for that. You never know where
              these explorations lead. That&rsquo;s kind of the point.
            </p>
          </>
        ),
      },
      {
        title: "Making It Relatable",
        content: (
          <>
            <p>
              <strong>When does dataviz become meaningful to you?</strong>
            </p>
            <p>
              When you can connect to the contents. If the story is somehow
              relatable. That&rsquo;s really it.
            </p>
            <p>
              I&rsquo;ve seen amazing technical work that I forget about
              immediately. And then some simple thing where the data is
              about something I recognize from my own life, and it stays
              with me. The technique doesn&rsquo;t matter as much as
              people think it does.
            </p>
            <p>
              <strong>So the craft matters less than people think?</strong>
            </p>
            <p>
              Both matter, but the connection comes first. Craft without
              connection is just showing off.
            </p>
          </>
        ),
      },
    ],
  },
  "giada-matteini": {
    name: "Giada Matteini",
    comingSoon: true,
    sections: [],
  },
  "jer-thorp": {
    name: "Jer Thorp",
    comingSoon: true,
    sections: [],
  },
  "rasagy-sharma": {
    name: "Rasagy Sharma",
    comingSoon: true,
    sections: [],
  },
  "jason-forrest": {
    name: "Jason Forrest",
    comingSoon: true,
    sections: [],
  },
};

export function generateStaticParams() {
  return Object.keys(conversations).map((slug) => ({ slug }));
}

export default function ConversationPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const data = conversations[slug];

  if (!data) {
    notFound();
  }

  return (
    <div style={{ background: "#111111", minHeight: "100vh" }}>
      <ContentLayout backHref="/" backLabel="Back">
        <article>
          <h1>{data.name}</h1>
          {(data.location || data.date) && (
            <p className="subtitle">
              {data.location}
              {data.location && data.date && " — "}
              {data.date}
            </p>
          )}

          {data.comingSoon ? (
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
          ) : (
            data.sections.map((section, index) => (
              <section key={index}>
                <h2>{section.title}</h2>
                {section.content}
              </section>
            ))
          )}

          <section style={{ paddingBottom: "8rem" }} />
        </article>
      </ContentLayout>
    </div>
  );
}
