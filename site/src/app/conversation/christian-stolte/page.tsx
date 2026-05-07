import { ConversationLayout } from "@/components/ConversationLayout";
import { Sidenote } from "@/components/Sidenote";

export default function ChristianStoltePage() {
  return (
    <ConversationLayout
      name="Christian Stolte"
      role={
        <>
          <a
            href="https://stoltedesign.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="meta-icon-link"
            aria-label="Christian Stolte's website"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM9.71002 19.6674C8.74743 17.6259 8.15732 15.3742 8.02731 13H4.06189C4.458 16.1765 6.71639 18.7747 9.71002 19.6674ZM10.0307 13C10.1811 15.4388 10.8778 17.7297 12 19.752C13.1222 17.7297 13.8189 15.4388 13.9693 13H10.0307ZM19.9381 13H15.9727C15.8427 15.3742 15.2526 17.6259 14.29 19.6674C17.2836 18.7747 19.542 16.1765 19.9381 13ZM4.06189 11H8.02731C8.15732 8.62577 8.74743 6.37407 9.71002 4.33256C6.71639 5.22533 4.458 7.8235 4.06189 11ZM10.0307 11H13.9693C13.8189 8.56122 13.1222 6.27025 12 4.24799C10.8778 6.27025 10.1811 8.56122 10.0307 11ZM14.29 4.33256C15.2526 6.37407 15.8427 8.62577 15.9727 11H19.9381C19.542 7.8235 17.2836 5.22533 14.29 4.33256Z" />
            </svg>
          </a>
          Data Visualization Designer
        </>
      }
      audioUrl="/audio/Christian.mp3"
    >
      <section>
        <p data-time="0" data-speaker="sai">
          <strong>I know you do a lot of biology related data visualizations
          and creating tools and whatnot. Would love to hear what you&rsquo;re
          mostly doing these days.</strong>
        </p>
        <p data-time="24" data-speaker="christian">
          I just came back from a conference I helped organize in Cambridge,
          UK. It&rsquo;s about visualizing biological data, called{" "}
          <a
            href="https://vizbi.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="meta-link"
          >
            VizBI
          </a>
          <Sidenote>
            <a
              href="https://vizbi.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="meta-link"
            >
              VizBI
            </a>{" "}
            is an annual conference on visualizing biological data, bringing
            together biologists, designers, and data visualization researchers
            to share methods and tools for making sense of complex
            life-sciences data.
          </Sidenote>
          , and I&rsquo;ve been attending almost yearly since 2011. The series
          started in 2010, so this year was the sixteenth meeting.
        </p>
        <p data-time="55" data-speaker="christian">
          I&rsquo;ve also been a speaker in the master class that&rsquo;s part
          of the conference. This year we were talking about how to use AI in
          data visualization, and how useful is it at this point. What are the
          best techniques, the tricks, to get the most out of various AI
          programs when it comes to data visualization. The bottom line was,
          that part is still very much a work in progress, and they
          haven&rsquo;t figured out a great way to do that yet.
        </p>
        <p data-time="98" data-speaker="sai">
          <strong>
            You have a bunch of different projects on your website, and one
            of them is the{" "}
            <a
              href="https://stoltedesign.com/DNAportraits.html"
              target="_blank"
              rel="noopener noreferrer"
              className="meta-link"
            >
              DNA portraits
            </a>
            <Sidenote>
              <a
                href="https://stoltedesign.com/DNAportraits.html"
                target="_blank"
                rel="noopener noreferrer"
                className="meta-link"
              >
                DNA Portraits
              </a>{" "}
              from personal genomics data.
            </Sidenote>
            . Could you tell me how that came about, and why you chose to show
            people&rsquo;s DNA in that way?
          </strong>
        </p>
        <p data-time="126" data-speaker="christian">
          That project started a few years back when I first used 23andMe to
          get my own DNA looked at. As part of what 23andMe offers, you can
          download your own data, and the picture they give you is very
          limited. They sequence a small portion of your DNA, around a million
          data points that they basically cherry picked out of your whole
          genome.
        </p>
        <p data-time="170" data-speaker="christian">
          Besides all the ancestry analysis and things like that, I was
          wondering: could I create some kind of image that shows you a
          snapshot of who you are genetically? And could I make that happen in
          a way that creates a different image for each person, but not in a
          random fashion. In a way that&rsquo;s deterministic, so if you run
          the same person&rsquo;s DNA data again, you get the same image.
        </p>
        <p data-time="214" data-speaker="christian">
          I was curious to see how different different people&rsquo;s genomes
          look. Can you really see a difference between you and me, or
          somebody else? I needed to find some way to summarize a million data
          points into a graphic that showed visible differences between the
          individual chromosomes, and between different individuals.
        </p>
        <p data-time="253" data-speaker="christian">
          Since DNA is organized in chromosomes, I thought a good starting
          point would be one graphic for each chromosome. I decided I was
          going to take account of all the different nucleotide combinations
          you see. It&rsquo;s simple combinatorics math. DNA only consists of
          four letters, and we have two letters for each position
          in the genome that 23andMe reads. One coming from your mom, one from
          your dad. That&rsquo;s your genetic inheritance. For each position
          you either get two matching letters, or different letters. Or
          sometimes you get no read. That happens, because the process
          isn&rsquo;t perfect.
        </p>
        <p data-time="324" data-speaker="christian">
          To show the different letters, I encoded the combinations in
          different colors. I assigned the four printing colors (cyan,
          magenta, yellow and black) to the four letters of the DNA alphabet.
          G, C, A, and T. The four bases all DNA is constructed from.
        </p>
        <p data-time="362" data-speaker="christian">
          When you get two A&rsquo;s, that&rsquo;ll be pure cyan, if cyan is
          A. If you get an A and a G, that would be cyan and yellow, so they
          combine to form a green. You get the idea. This way you can mix
          about eight different colors very easily.
        </p>
        <p data-time="393" data-speaker="christian">
          So I created a page I call the generator, where you can take your
          data and display it a few different ways. You can experiment with
          different shapes: ellipses, rectangles, squares. It was kind
          of fun playing around with it.
        </p>

        <figure>
          <a
            href="https://stoltedesign.com/DNAportraits.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/dna-ellipses2.png"
              alt="DNA portrait rendered as concentric ellipses, one shape per chromosome"
            />
          </a>
          <figcaption>
            DNA Portraits, ellipse rendering. From{" "}
            <a
              href="https://stoltedesign.com/DNAportraits.html"
              target="_blank"
              rel="noopener noreferrer"
              className="meta-link"
            >
              stoltedesign.com
            </a>
            .
          </figcaption>
        </figure>

        <p data-time="424" data-speaker="sai">
          <strong>The DNA is inherently a human thing. We&rsquo;re made up of
          DNA.</strong>
        </p>
        <p data-time="430" data-speaker="christian">
          Yeah. And when you render those ellipses as outlines, they kind of
          resemble the graphics you see for planetary systems. Everything
          aligned on one center, but with these different paths. That
          actually looked fairly poetic. They almost seem like galaxies. I
          know technically a galaxy is something very different, but they
          seemed like little planetary systems.
        </p>
        <p data-time="528" data-speaker="sai">
          <strong>It&rsquo;s beautiful. You have kind of the universe inside
          of you, in a way.</strong>
        </p>
        <p data-time="535" data-speaker="christian">
          You could say. The reactions I got were sort of mixed. Some people
          just didn&rsquo;t get it. Because there&rsquo;s nothing but geometry
          going on, it was maybe a little too abstract for people to react to
          emotionally.
        </p>
        <p data-time="578" data-speaker="christian">
          But at the same time, I got reactions from people who thought about
          it a little more, and they found it very pleasing and appealing.
          Because of that, a set of these graphics also ended up on a CD disc
          that was deposited on the moon.
        </p>
        <p data-time="589" data-speaker="christian">
          A friend of mine was involved in that project, sort of as an art
          director. They burned all these images onto the surface of small
          CD-ROM-sized golden disks that were sent to the moon, and sit there
          like a time capsule, waiting for somebody to discover and decode
          them. We had a whole genome sequence embedded in there, and my
          representation of that same genome encoded in these outlines. It
          was just a black and white image, but it still looked very
          interesting.
        </p>
        <p data-time="641" data-speaker="sai">
          <strong>That&rsquo;s incredible to even think about. That this
          piece of data visualization you made is on the moon. Talking about
          the moon, it reminds me of the paper you sent me, &lsquo;
            <a
              href="https://www.frontiersin.org/journals/bioinformatics/articles/10.3389/fbinf.2025.1708311/full"
              target="_blank"
              rel="noopener noreferrer"
              className="meta-link"
            >
              Why Science Needs Art
            </a>
            ,&rsquo;
            <Sidenote>
              <a
                href="https://www.frontiersin.org/journals/bioinformatics/articles/10.3389/fbinf.2025.1708311/full"
                target="_blank"
                rel="noopener noreferrer"
                className="meta-link"
              >
                Why Science Needs Art
              </a>
              . Article from Frontiers in Bioinformatics, October 2025.
            </Sidenote>
            {" "}that you contributed to. One of the first sentences
            mentions a film,{" "}
            <a
              href="https://en.wikipedia.org/wiki/A_Trip_to_the_Moon"
              target="_blank"
              rel="noopener noreferrer"
              className="meta-link"
            >
              A Trip to the Moon
            </a>
            , 1902.
            <Sidenote>
              <a
                href="https://en.wikipedia.org/wiki/A_Trip_to_the_Moon"
                target="_blank"
                rel="noopener noreferrer"
                className="meta-link"
              >
                A Trip to the Moon
              </a>
              . French science-fiction adventure trick film written, directed
              and produced by Georges Méliès. Inspired by the Jules Verne
              novel <em>From the Earth to the Moon</em>.
            </Sidenote>{" "}
            Even before any of the space exploration was done, it&rsquo;s a
            piece of art. Then later, in 1969, you have Neil Armstrong and
            the other astronauts actually setting foot on the moon.</strong>
        </p>
        <p data-time="683" data-speaker="christian">
          You can argue that art really helped inspire that space program. I
          don&rsquo;t know if it would have happened without artists first
          imagining that trip to the moon.
        </p>
        <p data-time="706" data-speaker="christian">
          In that way, art is a great way to just try things out with very
          little risk. You can imagine anything, and if you can make it
          visible to people, that can do all kinds of things. Even get them
          to build a real rocket that takes you to the moon.
        </p>
        <p data-time="739" data-speaker="sai">
          <strong>These two, art and science, seem to be on opposite sides
          of the spectrum. And if we take parallels and talk about
          data and emotion, data feels like this rigid thing, and emotion is
          this abstract, ever-flowing feeling. In your project, you said some
          people didn&rsquo;t get it, because you don&rsquo;t have a rigorous
          connection between what the data is and what the visual is telling
          you. It&rsquo;s not your usual bar chart. So how do you think that
          influences how people perceive the visual? Is having a more rigorous
          visualization always a good thing, or what are the reasons you
          choose to stay away from that and do a more artistic
          representation?</strong>
        </p>
        <p data-time="801" data-speaker="christian">
          When you work with an artistic representation, that gives you access
          to the world of emotion in a way. You leave the logical thinking
          and the dry reasoning that goes into science behind, and you enter
          a world that is more based on reactions. That&rsquo;s one of the
          roles emotions play in our lives all the time: they give us a way
          to make very, very quick decisions. People call it acting
          instinctively, or a gut reaction, because it&rsquo;s so fast, it
          just happens without you thinking about anything.
        </p>
        <p data-time="879" data-speaker="christian">
          That&rsquo;s the big difference between science and art. Science
          requires you to really consider things thoroughly, and there&rsquo;s
          a lot to understand and digest before you can make any conclusions.
          Often that&rsquo;s what people find so frustrating: that scientists
          never really want to commit to anything. There are
          always qualifiers. Only if all these conditions apply, then this
          really holds true. Whereas with feelings it&rsquo;s much more
          clear cut. You either are in love with something or you hate it, or
          you&rsquo;re shocked, or you&rsquo;re pleased. These things happen
          very quickly, and they&rsquo;re very clear, and relatable.
        </p>
        <p data-time="915" data-speaker="christian">
          By choosing a more artistic representation, I&rsquo;m trying to see
          if people can react in that more spontaneous way.
        </p>
        <p data-time="946" data-speaker="sai">
          <strong>The relatability aspect is interesting. Especially with the
          DNA stuff. You look at it and it&rsquo;s like, that&rsquo;s my DNA,
          that&rsquo;s me. You relate to your own person, or someone else.
          Another human.</strong>
        </p>
        <p data-time="991" data-speaker="christian">
          I tried out a couple of examples, I don&rsquo;t think I&rsquo;ve
          shown them to you, where I took a person&rsquo;s silhouette and
          superimposed the DNA graphics into it. So you have a dark shadow
          that&rsquo;s the outline of someone&rsquo;s profile, like a shadow
          you&rsquo;d cast on the wall if you had a light behind you.
          For most people you can say, okay, that looks like Christian, or
          no, that&rsquo;s Sai.
        </p>
        <p data-time="1054" data-speaker="christian">
          That made it a little more obviously personal. Because these
          abstract graphics otherwise don&rsquo;t make it possible to look at
          it from a distance and say, yeah, this is somebody I know, or show
          you a clear difference between two people. But if you combine it
          with that profile shadow, the silhouette gives you a way to
          identify quickly, and then you can dig in deeper.
        </p>
        <p data-time="1101" data-speaker="christian">
          So I&rsquo;d probably continue down that road if I were to pick up
          the project again. Because it gives you a frame that just says,
          okay, here we&rsquo;re looking at a human being.
        </p>
      </section>
    </ConversationLayout>
  );
}
