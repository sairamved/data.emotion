import { ContentLayout } from "@/components/ContentLayout";

export default function AboutPage() {
  return (
    <div style={{ background: "#111111", minHeight: "100vh" }}>
      <ContentLayout backHref="/" backLabel="Back">
        <article>
        <h1>About</h1>
        <p className="subtitle">

        </p>

        <section>
          {/* <h2>Project</h2> */}
          <p>
            Data and emotion seem like they are on the opposite ends of the
            spectrum. Data has an impression of being cold-hard truth, and
            emotion is a highly subjective feeling. But that&rsquo;s not always
            the case. Data is often being collected by someone with certain goals
            and subjective biases, and emotion is often an objective means to
            spark action. For the longest time, communication of data prioritised
            efficiency. In doing so, we confine ourselves to the same visual
            structures and rob audiences from a deeper level of engagement.
          </p>
          <p>
            We can begin to break free from this by asking what happens when we
            think of data-viz as a medium of expression instead of a tool for
            analysis. I&rsquo;ve started to see such sparks from influential
            data-viz practitioners, and my goal is to engage and contribute to
            the discourse. This sensibility is certainly not appropriate in all
            contexts, and there are pitfalls of manipulation and weaponization of
            data where emotion is involved. Which is why I believe having these
            conversations are important.
          </p>
          <p>
            At its core, this is a website that anyone can point at, to get an
            understanding of expressive data visualization, asking how and where
            it has its place in the communication of information. It&rsquo;s put
            together via a collection of conversations with people in the
            industry, those who practice data-viz day in and day out, accompanied
            by my own thoughts and sketches conceived from these conversations.
          </p>
        </section>

        <section>
          <h2>Motivation</h2>
          <p>
            The current norm of data-viz, as popularized by Edward Tufte, is to
            reduce the data to ink ratio, which comes from the actual ink used
            when printing data visualizations.
          </p>
          <blockquote>
            <p>
              Good graphics should include only data-Ink. Non-Data-Ink is to be
              deleted everywhere where possible. The reason for this is to avoid
              drawing the attention of viewers of the data presentation to
              irrelevant elements. The goal is to design a display with the
              highest possible data-ink ratio (that is, as close to the total of
              1.0), without eliminating something that is necessary for effective
              communication.
            </p>
            <footer>&mdash; InfoVis Wiki</footer>
          </blockquote>
          <p>
            This makes sense in the context of efficient communication. But to
            me, and to many others in the current zeitgeist, efficiency is not
            the only metric that should be used to gauge communication. Effective
            communication, especially of data, should have more context, of who
            collected it, and of what emotion the author is trying to convey.
            This is more the case when communication is intended to move an
            audience to take action, or at least consider &amp; think about the
            topic being conveyed.
          </p>
          <p>
            In the introduction of his book{" "}
            <em>Data Points</em>, Nathan Yau brings up an apt comparison that
            connects to a reasoning of the &lsquo;why&rsquo; behind
            this&mdash;&ldquo;Visualization is a way to represent data, an
            abstraction of the real world, in the same way that the written word
            can be used to tell different kinds of stories.&rdquo;
          </p>
          <p>
            Giorgia Lupi&rsquo;s work on data humanism has been central to this
            movement, but we honestly need more conversation to seep into how
            data communicators think today, and what they default to.
          </p>
        </section>

        <section>
          <h2>Audience</h2>
          <p>
            Folks in the data-viz industry who are looking to explore outside the
            preset templates of data viz (bar charts, pie charts, etc.) to
            communicate ideas with an emotional backing.
          </p>
        </section>

        <section style={{ paddingBottom: "8rem" }} />
      </article>
      </ContentLayout>
    </div>
  );
}
