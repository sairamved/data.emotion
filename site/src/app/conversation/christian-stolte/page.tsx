import { ConversationLayout } from "@/components/ConversationLayout";
import { Sidenote, MarginNote } from "@/components/Sidenote";

export default function ChristianStoltePage() {
  return (
    <ConversationLayout name="Christian Stolte" date="November 2025">
      <section>
        <h2>On Emotional Data</h2>
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
      </section>

      <section>
        <h2>DNA Portraits</h2>
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
      </section>

      <section>
        <h2>Making It Relatable</h2>
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
      </section>
    </ConversationLayout>
  );
}
