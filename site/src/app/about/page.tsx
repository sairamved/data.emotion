import Link from "next/link";
import { Nav } from "@/components/Nav";
import { asset } from "@/lib/asset";

export default function AboutPage() {
  return (
    <div style={{ background: "#000000", minHeight: "100vh" }}>
      <Nav showLogo hideAbout />

      <article className="conversation">
        <header className="conversation-header" style={{ marginBottom: "2rem" }}>
          <h1 className="conversation-title">About</h1>
        </header>

        <div className="conversation-body">
          <section>
            <p>
              Data and emotion seem like they are on the opposite ends of the
              spectrum. Data has an impression of being cold-hard truth, and
              emotion is a highly subjective feeling. But that&rsquo;s not always
              the case. Data is often being collected by someone with certain goals
              and subjective biases, and emotion is often an objective means to
              spark action.
            </p>
            <p>
              For the longest time, communication of data prioritised efficiency.
              In doing so, we confine ourselves to the same visual structures and
              rob audiences from a deeper level of engagement.
            </p>
            <p>
              We can begin to break free from this by asking what happens when we
              think of data-viz as a medium of expression instead of a tool for
              analysis. I&rsquo;ve started to see such sparks from influential
              data-viz practitioners, and my goal is to engage and contribute to
              the discourse. This sensibility is certainly not appropriate in all
              contexts, and there are pitfalls of manipulation and weaponization
              of data where emotion is involved. Which is why I believe having
              these conversations are important.
            </p>
            <p>
              At its core, this is an archive. A collection of conversations with people actively engaging with this idea,
              accompanied by my own thoughts and sketches conceived from these
              conversations.
            </p>
          </section>

          <div className="carousel">
            <video
              src={asset("/videos/genuary26-29.mp4")}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
            <video
              src={asset("/videos/flame.mp4")}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
            <video
              src={asset("/videos/genuary26-20.mp4")}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>

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
                irrelevant elements.
              </p>
              <footer>
                —{" "}
                <a
                  href="https://infovis-wiki.net/wiki/Data-Ink_Ratio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta-link"
                >
                  InfoVis Wiki
                </a>
              </footer>
            </blockquote>
            <p>
              This makes sense in the context of efficient communication. But to
              me, and to many others in the current zeitgeist, efficiency is not
              the only metric that should be used to gauge communication.
              Effective communication, especially of data, should have more
              context, of who collected it, and of what emotion the author is
              trying to convey. This is more the case when communication is
              intended to move an audience to take action, or at least consider
              &amp; think about the topic being conveyed.
            </p>
            <p>
              In the introduction of his book{" "}
              <a
                href="https://flowingdata.com/books/"
                target="_blank"
                rel="noopener noreferrer"
                className="meta-link"
              >
                <em>Data Points</em>
              </a>
              , Nathan Yau
              brings up an apt comparison that connects to a reasoning of the
              &lsquo;why&rsquo; behind this&mdash;&ldquo;Visualization is a way to
              represent data, an abstraction of the real world, in the same way
              that the written word can be used to tell different kinds of
              stories.&rdquo;
            </p>
            <p>
              Giorgia Lupi&rsquo;s work on data humanism has been central to this
              movement, but we honestly need more conversation to seep into how
              data communicators think today, and what they default to.
            </p>
          </section>

          <section>
            <p>
              There&rsquo;s also a small participatory piece &mdash; an
              archive of how people <em>feel</em> about data and emotion.
              You can{" "}
              <Link href="/draw" className="meta-link">
                draw your own
              </Link>
              , or{" "}
              <Link href="/gallery" className="meta-link">
                see the archive
              </Link>
              .
            </p>
            <p>
              If you&rsquo;re someone who&rsquo;s actively engaged in thinking
              about this, let&rsquo;s talk. Reach me at{" "}
              <a
                href="mailto:hello@sairamved.com"
                className="meta-link"
              >
                hello@sairamved.com
              </a>
              .
            </p>
          </section>
        </div>

        <div style={{ paddingBottom: "8rem" }} />
      </article>
    </div>
  );
}
