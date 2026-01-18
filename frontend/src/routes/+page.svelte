<script lang="ts">
  import Layout from '$layouts/main-layout.svelte'

  import EncryptedEmail from '$components/encrypted-email.svelte'
  import { SITE_NAME, instagramProfileLink } from '$lib/constants'
  import Divider from '$components/divider.svelte'
  import { cn } from '$lib/utils'
  import { buttonVariants } from '$components/ui/button'

  import kursinbjudan from '$assets/inbjudan-surdegskurs.png?enhanced'
  import allerthsBageriLogo from '$assets/allerths-bageri-logo.jpeg?enhanced'
  import boxWithGoodies from '$assets/box-med-bakat.jpg?enhanced'
  import breadMarketPlace from '$assets/brod-i-lada.jpeg?enhanced'
  import fika from '$assets/fika.jpg?enhanced'
  import kakaobrod from '$assets/kakaobrod.jpg?enhanced'
  import kladdkakekakor from '$assets/kladdkakekakor.jpg?enhanced'
  import sourdoughBowlForBakingCourse from '$assets/bunke-surdegsbakning-kurs.jpeg?enhanced'
  import sixthHantverksbrod from '$assets/hantverksbrod6.jpg?enhanced'
  import herbBowl from '$assets/herb-bowl-portrait2.jpg?enhanced'
  import mariaBlender from '$assets/maria-blender.jpg?enhanced'
  import pumpabrod from '$assets/pumpabrod.jpeg?enhanced'
  import sax from '$assets/sax.jpg?enhanced'
  import vitsippor from '$assets/vitsippor-vandring.jpg?enhanced'
  import breadPrenumeration from '$assets/brod-prenumeration.jpeg?enhanced'
  import breadMarket from '$assets/brod-marknad.jpeg?enhanced'
  import leaderSjuharad from '$assets/leader-sjuharad.png?enhanced'
  import saxophoneRetreat from '$assets/saxofonretreat.jpeg?enhanced'
  import saxophoneRetreatBread from '$assets/saxofonretreat-brod.jpeg?enhanced'

  const bakingCourseDate = new Date('2026-01-11').toLocaleString('sv-SE', {
    dateStyle: 'full',
  })
</script>

<Layout class="max-w-3xl xs:px-4" footer>
  <header class="py-8 text-center">
    {#if import.meta.env.DEV}
      <div class="grid w-full grid-cols-[1fr_3fr_1fr] place-items-center gap-4">
        <div></div>
        <div
          class="grid grid-cols-[max-content_1fr] items-center justify-center gap-x-4"
        >
          <span class="col-span-full text-sm font-light tracking-widest">
            Välkommen till
          </span>
          <enhanced:img
            src={allerthsBageriLogo}
            alt="Profilbild för Allerths Bageri"
            class="aspect-square size-20 rounded-full object-cover shadow-md"
            loading="eager"
            fetchpriority="high"
          />
          <h1
            class="inline-flex pt-2 font-display text-2xl font-bold 2xs:text-3xl xs:text-4xl sm:text-5xl md:text-6xl"
          >
            {SITE_NAME}
          </h1>
        </div>
        <nav class="flex flex-col justify-center">
          <a
            href="/order"
            class={cn([buttonVariants({ variant: 'outline', size: 'xl' })])}
          >
            Beställ bröd
          </a>
        </nav>
      </div>
    {:else}
      <div>
        <span class="text-sm font-light tracking-widest">Välkommen till</span>
        <div class="flex items-center justify-center gap-4">
          <enhanced:img
            src={allerthsBageriLogo}
            alt="Profilbild för Allerths Bageri"
            class="aspect-square size-20 rounded-full object-cover shadow-md"
            loading="eager"
            fetchpriority="high"
          />
          <h1
            class="inline-flex pt-2 font-display text-4xl font-bold sm:text-6xl"
          >
            {SITE_NAME}
          </h1>
        </div>
      </div>
    {/if}
  </header>

  <enhanced:img
    class="max-h-[400px] w-full object-cover shadow-md xs:rounded-md"
    src={breadMarketPlace}
    alt="Surdegsbröd från Allerths Bageri"
    loading="eager"
    fetchpriority="high"
  />
  <section class="relative">
    <section id="main-content">
      <section class="flex items-center justify-center">
        <div class="mx-auto w-full">
          <Divider class="my-8" />
          <div class="mx-auto max-w-sm text-center text-balance" id="intro">
            <p class="font-display text-3xl font-bold">Hantverksbröd</p>
            <p class="pt-4">
              Jag bakar med färskmalen kultursäd - exempelvis emmer eller
              purpurvete. Emmer började odlas för 8000 år sedan och är en
              korsning mellan enkorn och vildgräs.
            </p>
          </div>
          <Divider class="my-8" />

          <section class="mb-8 flex flex-col gap-5">
            <a
              href="#news"
              class="px-6 py-2 text-center font-display text-4xl text-green-500 underline underline-offset-2 hover:underline focus:text-green-500 focus:underline"
              >Se <span class="whitespace-nowrap">nyheter</span></a
            >
            <a
              href="#event"
              class="px-6 py-2 text-center font-display text-4xl text-green-500 underline underline-offset-2 hover:underline focus:text-green-500 focus:underline"
              >Se <span class="whitespace-nowrap">kommande event</span></a
            >
            <p class="text-center text-2xl text-gray-200">♫</p>
            <EncryptedEmail />
            <ul class="flex justify-center">
              <li>
                <enhanced:img
                  src={allerthsBageriLogo}
                  alt="Profilbild"
                  class="mr-2 inline-block h-8 w-8 rounded-full object-cover shadow-md"
                />
                <a
                  href={instagramProfileLink}
                  class="inline-block font-medium underline-offset-2 hover:text-green-500 hover:underline focus:text-green-500 focus:underline"
                >
                  @allerthsbageri
                </a>
              </li>
            </ul>
          </section>

          <div class="mx-4 flex justify-center" id="historia">
            <enhanced:img
              class="h-auto w-full max-w-[400px] rounded-md object-cover shadow-md xs:rounded-md"
              src={boxWithGoodies}
              loading="eager"
              alt="Låda med bakverk, örter och växter."
            />
          </div>

          <article class="my-8 w-full px-4">
            <h3 class="text-center font-display text-3xl font-bold">
              Historia
            </h3>
            <p class="mt-4">
              Min mormor och morfar, Sven och <span class="whitespace-nowrap"
                >Maj-Britt</span
              > Allerth hade ett fantastiskt väldoftande och välfyllt bageri som skapade
              minnen för livet. Det var fyllt med generationer av kunskap och engagemang.
            </p>
            <p class="mt-4">
              Nu kommer morfars brödlådor med telefonnummer 14 till användning
              igen. Med glädje och kärlek har Allerths bageri åter startat, det
              ska fyllas med örter och bakverk från naturen, kombinerat med
              musik i olika former.
            </p>
          </article>

          <div class="gap my-8 grid columns-2 grid-cols-2 grid-rows-2 gap-2">
            <enhanced:img
              class="aspect-square h-auto w-full rounded-md object-cover shadow-md"
              src={allerthsBageriLogo}
              alt="Kulturbröd uppställt för försäljning"
            />
            <enhanced:img
              class="aspect-square h-auto w-full rounded-md object-cover shadow-md"
              src={sixthHantverksbrod}
              alt="Kulturbröd uppställt för försäljning"
            />
            <enhanced:img
              class="aspect-square h-auto w-full rounded-md object-cover shadow-md"
              src={pumpabrod}
              alt="Kulturbröd uppställt för försäljning"
            />
            <enhanced:img
              class="aspect-square h-auto w-full rounded-md object-cover shadow-md"
              src={breadMarketPlace}
              alt="Kulturbröd uppställt för försäljning"
            />
          </div>

          <article class="flex justify-center text-center">
            <p class="my-2">Hantverksbröd bakat på kultursäd.</p>
          </article>

          <Divider />

          <section id="news">
            <h4 class="mb-4 text-center font-display text-2xl">Nyheter!</h4>

            <article class="grid justify-center gap-2 xs:grid-cols-2 xs:px-4">
              <enhanced:img
                class="mx-auto h-auto max-h-[500px] min-h-60 w-full max-w-[300px] items-center rounded-r-md object-cover shadow-md xs:rounded-md"
                src={breadPrenumeration}
                alt="Hantverksbröd"
              />
              <div class="mt-4 pr-4">
                <p class="mb-4 text-center font-display text-4xl font-bold">
                  Nu lanserar Allerths bageri brödprenumeration!
                </p>
                <p class="mt-4 px-4 text-center">
                  Du har nu möjlighet att starta en brödprenumeration: 2 till
                  10/15 bröd per månad eller varannan månad så du är säker på
                  att alltid ha tillgång till goda hantverksbröd.
                </p>
              </div>
            </article>

            <p class="mt-8 px-4 text-center">
              Du kan just nu välja mellan ett ljusare surdegsbröd eller rågkraft
              som bakas på enbart råg. Du kan avsluta din prenumeration när du
              önskar dock senast tre hela arbetsdagar innan nästa leverans.
            </p>

            <p class="mt-8 px-4 text-center">
              Boka din prenumeration via mejl: <EncryptedEmail />
            </p>

            <div class="mt-8 flex justify-center">
              <enhanced:img
                class="h-auto w-full rounded-l-md object-cover shadow-md"
                src={kakaobrod}
                alt="Surdegsbröd med kakao som dekoration för halloween."
              />
              <enhanced:img
                class="aspect-square h-full w-full rounded-r-md object-cover shadow-md"
                src={kladdkakekakor}
                alt="Kakor gjorda på kladdkaka"
              />
            </div>

            <Divider />

            <p class="mt-8 px-4 text-center">
              Allerths bageri har tilldelats ett microstöd från Leader Sjuhärad
              "förstudie i entreprenörskap" för att kunna utöka bageriets
              verksamhet. Dessutom fokus på miljö och hållbarhet.
            </p>

            <div class="mt-8 flex justify-center">
              <enhanced:img
                class="h-auto w-full rounded-md object-cover p-4 shadow-md"
                src={leaderSjuharad}
                alt="Logotyp Leader Sjuhärad"
              />
            </div>

            <Divider />

            <p class="px-4 text-center">
              Nyhet! Du kan också beställa vårt bröd via REKOringen.
            </p>
            <p class="mt-8 px-4 text-center">Leverans:</p>
            <ul class="list-inside list-['-_'] space-y-2 text-center">
              <li>Jämna veckor - Ulricehamn</li>
              <li>Ojämna veckor - Borås & Fristad</li>
            </ul>

            <Divider />

            <h3 class="mb-8 text-center font-display text-3xl font-bold">
              Kommande marknader där du träffar Allerths bageri:
            </h3>

            <article class="grid gap-4 xs:grid-cols-2">
              <enhanced:img
                class="mx-auto h-auto max-h-[500px] min-h-60 w-full max-w-[300px] items-center rounded-r-md object-cover shadow-md xs:rounded-md"
                src={breadMarket}
                alt="Hantverksbröd till försäljning på marknad"
              />

              <ul class="list-inside list-disc space-y-2 px-4 xs:pl-0">
                <li>
                  Torsdagar från kl 09.00 finns färskt surdegsbröd vid Tolkabro
                  handel. Kolla instagram för eventuella ändringar <a
                    href={instagramProfileLink}
                    target="_blank"
                    class="text-green-500 underline-offset-2 hover:text-green-500 hover:underline focus:underline"
                    >@allerthsbageri</a
                  >
                </li>
                <li>
                  20 september Marknad i Götseredsstugan, Sandhult. Kl 11.00 -
                  16.00 eller tills det är slutsålt
                </li>
                <li>11 oktober kl 11.00 Bogastugan Hökerum</li>
                <li>Konstrundan Toarp 11.00</li>
                <li>
                  Från och med 2 oktober finns bageriet åter med vid rekoringen
                  Borås, Ulricehamn, eventuellt Fristad i framtiden också
                </li>
                <li>Handelsplats Od från och med 18 oktober</li>
              </ul>
            </article>
          </section>

          <Divider />

          <article class="my-4 w-full px-4 pt-4" id="event">
            <h4 class="mb-4 text-center font-display text-2xl">
              Kommande event:
            </h4>

            <section>
              <h2 class="mb-4 text-center font-display text-4xl font-bold">
                Är du redo för positiv förändring?
              </h2>
              <div class="flex justify-center">
                <p class="my-2 max-w-screen-sm text-2xl">
                  SAXOFONRETREAT 14/3 kl 9.30 - ca 17.00
                </p>
              </div>
<!--
              <div class="flex justify-center">
                <p class="my-2 max-w-screen-sm">
                  Ge dej själv den bästa julklappen - kreativ tid för din själ
                </p>
              </div> -->

              <div class="flex justify-center">
                <p class="my-2 max-w-screen-sm">
                  Välkommen till en kravlös och magisk dag där du får chans att släppa
                  vardagens stress och måsten och istället påbörja din inre resa
                  mot ett sannare jag.
                </p>
              </div>

              <enhanced:img
                class="mx-auto my-8 mt-8 h-auto w-full max-w-[500px] object-cover"
                src={saxophoneRetreat}
                alt="Välkommen till en saxofonretreat"
              />

              <div class="flex justify-center">
                <p class="my-2 max-w-screen-sm">
                  I denna endagsretreat får du nya insikter, du får möta andra
                  likasinnade och om du själv vill så öppnas nya dörrar för dej,
                  du får växa som människa.
                </p>
              </div>

              <div class="flex justify-center">
                <p class="my-2 max-w-screen-sm">
                  Maggan Allerth heter jag som leder dagen. Du får del av mina
                  saxofoners rogivande toners musik, kristallskålarnas milda
                  mjuka helande, läkande sång, tuning och rörelse. Du får med
                  dej nya verktyg hem som du kan använda i din vardag. Ett yogapass med Lotta
                  Andersson som yogainstruktör och gongspel ingår också.
                </p>
              </div>

              <enhanced:img
                class="mx-auto my-8 h-auto w-full max-w-[350px] object-cover"
                src={saxophoneRetreatBread}
                alt="Bild på bröd vid saxofonretreat"
              />

              <div class="mx-auto mb-2 max-w-screen-sm">
                Vi kommer jobba med Tuning-vårdande ljud, som är som näring för rösten. Vilket också kan påbörja en läkningsprocess i din kropp. Jag utgår ifrån Marie Bergmans metod.
              </div>

              <div class="mx-auto mb-2 max-w-screen-sm">
                Denna dag är för dej som vill uppnå en djupare avslappning. Vi jobbar med ärkeänglarna, bland annat med avslappning på cellnivå.
              </div>

              <div class="mx-auto mb-2 max-w-screen-sm">
                Min intention med dagen är att du ska få ta emot, få vila i dej
                själv, känna glädje och stilla ro mitt i allt det du står i just
                nu och upptäcka nya sidor hos dej själv.
              </div>

              <div class="mx-auto my-2 max-w-screen-sm">
                <p>
                  Denna heldag inkluderar mat, <a
                    href={instagramProfileLink}
                    target="_blank"
                    class="text-green-500 underline-offset-2 hover:text-green-500 hover:underline focus:underline"
                    >@allerthsbageri</a
                  > står för surdegsbröd till lunchen & även något gott till eftermiddagsfikat.
                </p>
                <p>
                  Investeringen i dej själv kostar 1990 kr, anmälan senast den
                  11/3 kl 18.00.
                </p>
                <p>
                  Det finns möjlighet till boka tidigt rabatt 1700 kr senast
                  1/2.
                </p>
              </div>

              <Divider class="my-5" />

              <div class="mx-auto my-2 max-w-screen-sm">
                <p>Betalning sker vid ankomst. Swish eller kontant.</p>
                <p>Meddela gärna allergier i god tid.</p>
              </div>

              <div class="mx-auto max-w-screen-sm">
                <p class="my-2">
                  <span class="font-bold">Var:</span>
                  Hällstads bygdegård. HÄLLSTAD 142, 523 95 Älmestad.
                </p>

                <p class="my-2">
                  <span class="font-bold">Att ta med:</span>
                  Yogamatta eller liggunderlag. Kudde och mjuka kläder.
                </p>

                <p class="text-center font-bold">
                  Välkommen med din anmälan eller frågor till:
                </p>
                <div class="flex justify-center text-center">
                  <EncryptedEmail />
                </div>
              </div>
            </section>

            <Divider />

            <section>
              <h2 class="mb-4 text-center font-display text-4xl font-bold">
                Saxofonmeditation
              </h2>
              <div class="mx-auto mb-2 max-w-screen-sm">
                <p class="my-2">Nästa saxofonmeditation blir den 1/2 kl 16.</p>

                <p class="my-2">Vintertid är vi i Equmeniakyrkan i Hökerum. När våren kommer flyttar meditationen ut i skogen igen.</p>

                <p class="my-2">
                  Efteråt fikar vi tillsammans, surdegsmacka från <a
                    href={instagramProfileLink}
                    target="_blank"
                    class="text-green-500 underline-offset-2 hover:text-green-500 hover:underline focus:underline"
                    >@allerthsbageri</a
                  > och örtte.
                </p>
              </div>

              <Divider class="my-5" />

              <div class="mx-auto max-w-screen-sm">
                <p class="my-2">
                  <span class="font-bold">När:</span>
                  Kommande meditiationer: 21/9, 19/10, 2/11, 16/11, 7/12, 4/1, 1/2, 1/3, 29/3
                </p>
                <p class="my-2">
                  <span class="font-bold">Kostnad:</span>
                  220 kr
                </p>
                <p class="my-2">
                  <span class="font-bold">Var: </span>
                  Grovare Spången 101, utanför Hökerum.
                  <span class="font-bold">Vintertid:</span> Equmeniakyrkan, Hökerum.
                </p>

                <p class="text-center font-bold">
                  ✨ Välkommen med din anmälan till:
                </p>
                <div class="flex justify-center text-center">
                  <EncryptedEmail />
                </div>
              </div>
            </section>

            <Divider />

            <section>
              <div class="my-8 grid justify-center" id="event">
                <enhanced:img
                  class="h-auto w-full rounded-md object-cover shadow-md"
                  src={kursinbjudan}
                  alt="Inbjudan till kurs"
                />
              </div>

              <h2 class="mb-4 text-center font-display text-4xl font-bold">
                Nu kan du anmäla dig till kurs i surdegsbakning
              </h2>
              <div class="flex justify-center">
                <p class="my-2 max-w-screen-sm">
                  I januari blir det ny kurs i hur du bakar
                  surdegsbröd på enbart ekologiskt och kravmärkt mjöl. Vi lär
                  oss mata surdegen, forma och snitta bröd. Sätta en ny deg som
                  du kan grädda hemma nästa dag.
                </p>
              </div>

              <Divider class="my-5" />

              <div class="flex justify-center">
                <p class="my-2 max-w-screen-sm">
                  Till lunch blir du bjuden på surdegspizza. I kursavgiften
                  ingår även kaffe/te, färskpressad juice, en snittkniv och en
                  skål att frakta brödet i. Om du vill får du även med en liten
                  surdegsstarter hem.
                </p>
              </div>

              <div class="flex justify-center">
                <p class="max-w-screen-sm justify-center">
                  Du behöver ta med två tunna kökshanddukar och ett förkläde.
                </p>
              </div>

              <Divider class="my-5" />

              <div class="mx-auto max-w-screen-sm">
                <p class="my-2">
                  <span class="font-bold">När:</span>
                  <span class="capitalize">{bakingCourseDate}</span>
                  <span> 09.30 - 13.30 eller tills vi känner oss klara.</span>
                </p>
                <p class="my-2">
                  <span class="font-bold">Kursavgift: </span> 1200 kr, betalas via
                  Swish i samband med anmälan. Vid överenskommelse kontant betalning
                  på plats.
                </p>
                <p class="my-2">
                  <span class="font-bold">Var: </span> Equmeniakyrkans kök, Hökerum
                </p>
                <p class="text-center font-bold">Anmälan & frågor:</p>
                <div class="flex justify-center text-center">
                  <EncryptedEmail />
                </div>
                <p class="my-2 text-center text-lg">Välkommen!</p>
              </div>

              <enhanced:img
                class="mx-auto mt-8 h-auto w-2/3 rounded-md object-cover shadow-md"
                src={sourdoughBowlForBakingCourse}
                alt="Kulturbröd uppställt för försäljning"
              />
            </section>

            <Divider />

            <section>
              <h2 class="mb-4 text-center font-display text-4xl font-bold">
                Håll utkik efter nästa örtevent
              </h2>
              <div class="flex justify-center">
                <p class="max-w-screen-sm">
                  Kom med och lär dej om våra vanligaste örter/läkeväxter. Hur
                  bereds de? Hur använder du dem på bästa sätt i din matlagning
                  eller som läkeväxt.
                </p>
              </div>

              <div class="my-4">
                <div class="max-w-[320px]-sm flex w-full justify-center">
                  <enhanced:img
                    class="w-full rounded-l-md object-cover shadow-md"
                    src={mariaBlender}
                    alt="Maria mixar ört-smoothie."
                  />
                  <enhanced:img
                    class="w-full rounded-r-md object-cover shadow-md"
                    src={vitsippor}
                    alt="Vandring bland vitsippor."
                  />
                </div>
              </div>
              <div class="flex justify-center">
                <p class="max-w-screen-sm">
                  Nya örtvandringar planeras framöver. Hembygdsgården i
                  Algutstorp, Rångedala. Kläder efter väder och sittunderlag
                  medtages. Ni bjuds på örtte och hembakat bröd fyllt med örter
                  och ost.
                </p>
              </div>
              <p class="my-2 text-center">Pris 350kr. Betalas på plats.</p>
              <p class="text-center">Anmälan sker till</p>
              <section class="flex justify-center gap-2 text-center">
                <p>Maggan:</p>
                <EncryptedEmail />
              </section>
              <section class="flex justify-center gap-2 text-center">
                <p>Maria:</p>
                <a
                  href="mailto:halsorum@gmail.com"
                  class="text-green-500 underline-offset-2 hover:text-green-500 hover:underline focus:text-green-500 focus:underline"
                  >halsorum@gmail.com</a
                >
              </section>
              <p class="my-2 text-center text-lg">Välkommen!</p>

              <div class="my-4 flex justify-center">
                <enhanced:img
                  class="h-auto w-full max-w-[600px] rounded-md object-cover shadow-md"
                  src={fika}
                  alt="Fika och smoothie-provning på ett event."
                />
              </div>
            </section>

            <Divider />

            <section>
              <h3 class="mb-4 font-display text-3xl font-bold">
                Övrigt smått & gott
              </h3>
              <ul class="list-inside list-disc space-y-2">
                <li>
                  Vissa lördagar säljer jag mitt hantverksbröd direkt vid
                  bageriet, för exakt info om försäljningen följ på instagram <a
                    href={instagramProfileLink}
                    target="_blank"
                    class="text-green-500 underline-offset-2 hover:text-green-500 hover:underline focus:underline"
                    >@allerthsbageri</a
                  >. Ett surdegsbröd bakat på kultursäd, så som Emmer och
                  vetemjöl special. Du kan beställa via <EncryptedEmail />
                </li>
                <li>
                  Levererar örter och bröd till Grovare Event & kafé, Marie
                  Arturéns härliga och mysiga kafé i Grovare.
                </li>
                <li>
                  Musik i sommarkväll med Sanna Moberg-sång/piano & Maggan
                  Allerth-saxofon
                  <p>- 17 juni kl 19.00 Brämhults kyrka, Borås</p>
                  <p>- 29 juli kl 19.00 Hakarps kyrka, Huskvarna</p>
                  <p>- 17 augusti kl 18.00 Ljushults kyrka, Aplared</p>
                </li>
                <li>
                  Kören FREKVENS startar 15/9 kl 18:00. Lokal meddelas senare. <a
                    href="#frekvens"
                    class="text-green-500 underline-offset-2 hover:text-green-500 hover:underline focus:underline"
                    ><span class="whitespace-nowrap">Läs mer</span></a
                  >
                </li>
              </ul>
            </section>
          </article>

          <Divider class="my-8" />

          <article class="my-4" id="om-mig">
            <h3 class="mb-4 text-center font-display text-3xl font-bold">
              Om mig
            </h3>
            <div class="my-4 flex justify-center px-4">
              <enhanced:img
                class="h-auto max-h-[500px] w-auto rounded-md object-cover shadow-md"
                src={sax}
                alt="Maggan spelar saxofon i trädgården."
              />
            </div>
            <div class="flex justify-center">
              <p class="max-w-screen-sm p-4" id="friskvård">
                Maggan Allerth heter jag och är utbildad musiklärare,
                kyrkomusiker och örtpedagog. Älskar surdegsbröd, örter och
                körmusik. Glädjen över att få människor att må bra via
                surdegsbröd, musik och läkeväxter är min drivkraft.
              </p>
            </div>
          </article>

          <article class="grid grid-cols-2 gap-2 xs:px-4">
            <enhanced:img
              class="h-auto max-h-[500px] min-h-60 w-full max-w-[300px] items-center rounded-r-md object-cover shadow-md xs:rounded-md"
              src={herbBowl}
              alt="Bunke med örter."
            />
            <div class="mt-4 pr-4">
              <h3 class="text-center font-display text-3xl font-bold">
                Örter & bakverk
              </h3>
              <p class="mt-4 px-4 text-center">
                I naturen finns mängder av läkeörter som förbättrar vår hälsa på
                ett hållbart sätt.
              </p>
              <p class="col-span-2 px-4 pt-8 xs:text-center">
                Ta vara på det naturen ger, både som mat och stödjande för vissa
                symptom. Något annat som främjar din hälsa är också körsång.
              </p>
            </div>
          </article>

          <Divider />

          <article class="mx-auto my-4 max-w-screen-sm" id="frekvens">
            <h3 class="mb-4 text-center font-display text-3xl font-bold">
              Friskvårdskör
            </h3>
            <p class="mx-auto px-4">
              Körsång på recept borde många ordineras. När du jobbar med andning
              och rörelse främjar det hela din kropps energisystem. Du mår bra
              när endorfiner släpps lös genom körsång. I kören FREKVENS träffar
              du andra likasinnade.
            </p>
            <p class="mx-auto px-4 py-2">
              Kören FREKVENS träffas varannan måndag kl 18.00-19.30. Start 15/9.
              Lokal meddelas senare.
            </p>
            <p class="mx-auto px-4 py-2">Anmälningsavgift 500kr.</p>

            <p class="mx-auto px-4 py-4">
              Kontakta Maggan om du vill veta mer och anmäla dig:
              <EncryptedEmail />
            </p>
          </article>
        </div>
      </section>
    </section>
  </section>
</Layout>
