// 問題データ。すべてオリジナル。tag は文法レッスンと Part 5 をつなぐ
const LESSONS = [
  { tag: "品詞", lv: 1, title: "品詞：名詞・動詞・形容詞・副詞", body: [
    "英語の単語は役割で分かれます。名詞（もの・人・ことの名前）、動詞（動作や状態）、形容詞（名詞を説明する）、副詞（動詞や形容詞を説明する）。",
    "Part 5 で一番多いのが品詞の問題です。選択肢が kind / kindly / kindness のように同じ語の形違いなら、空所の前後を見て「どの品詞が入るか」だけで解けます。",
    "目印：a / the / my の後ろは名詞（か形容詞＋名詞）。名詞の前は形容詞。動詞を説明するのは副詞（-ly で終わる語が多い）。",
    "語尾のヒント：-tion, -ment, -ness は名詞、-ful, -ous, -ive, -al は形容詞、-ly は副詞。"],
    ex: [["She is a careful driver.", "彼女は注意深い運転手だ。（driver を説明する形容詞）"], ["She drives carefully.", "彼女は注意深く運転する。（drives を説明する副詞）"], ["Thank you for your attention.", "ご清聴ありがとうございます。（your の後ろは名詞）"]] },
  { tag: "be動詞", lv: 1, title: "be動詞と一般動詞", body: [
    "英語の文は「主語＋動詞」で始まります。動詞は2種類。be動詞（am / is / are / was / were）は「〜である・〜にいる」、一般動詞（go, work, like など）は動作や気持ちを表します。",
    "主語が I なら am、you や複数なら are、he / she / it や1人・1つなら is。",
    "一般動詞は、主語が3人称単数（he, she, Mr. Sato など）で現在のとき、語尾に -s をつけます（goes, works）。",
    "否定と疑問：be動詞は is not / Are you 〜?、一般動詞は do not / does not / Do you 〜? を使います。be動詞と一般動詞は並べません（× is go）。"],
    ex: [["I am a sales clerk.", "私は販売員です。"], ["He works at a bank.", "彼は銀行で働いている。"], ["Does she like coffee?", "彼女はコーヒーが好きですか。"]] },
  { tag: "時制", lv: 1, title: "時制：現在・過去・未来", body: [
    "動詞の形で「いつのことか」を表します。現在形は習慣や事実（usually, every day）、過去形は終わったこと（yesterday, last week, ago）、未来は will ＋動詞の原形（tomorrow, next week）。",
    "Part 5 では、文の中の時の言葉（last month, next Friday, since 2020 など）が答えのヒントです。まず時の言葉を探しましょう。",
    "if や when の後ろでは、未来のことでも現在形を使います（If it rains tomorrow, …）。"],
    ex: [["I visited the factory last week.", "先週、工場を訪問した。"], ["We will launch the product next month.", "来月その製品を発売する。"], ["When he arrives, please call me.", "彼が着いたら電話してください。"]] },
  { tag: "代名詞", lv: 1, title: "代名詞：I / my / me / mine", body: [
    "人や物を指す言葉は、文の中の位置で形が変わります。主語なら I / he / they、名詞の前なら my / his / their（所有格）、動詞や前置詞の後ろなら me / him / them（目的格）。",
    "mine / hers / theirs は「〜のもの」、myself / himself は「自分自身」。",
    "空所の直後が名詞なら所有格、と覚えておくと速く解けます。"],
    ex: [["Our manager called them yesterday.", "私たちの部長は昨日、彼らに電話した。"], ["This seat is mine.", "この席は私のものです。"], ["She fixed the printer herself.", "彼女は自分でプリンターを直した。"]] },
  { tag: "前置詞", lv: 1, title: "前置詞：時と場所", body: [
    "前置詞は名詞の前に置いて時や場所を表します。時刻は at（at 10:00）、曜日・日付は on（on Monday）、月・年は in（in May, in 2025）。",
    "期限の by（〜までに）と継続の until（〜までずっと）、期間の during（〜の間）、以内の within は Part 5 の常連です。",
    "場所：at（地点）、in（中）、on（接して上）、between A and B（AとBの間）、across from（〜の向かい）。"],
    ex: [["Please submit it by Friday.", "金曜日までに提出してください。"], ["The store is open until 9 P.M.", "店は午後9時まで開いている。"], ["The bank is across from the station.", "銀行は駅の向かいにある。"]] },
  { tag: "助動詞", lv: 2, title: "助動詞：can / will / must / should", body: [
    "助動詞は動詞の前について意味を加えます。can（できる）、will（〜するだろう）、must（〜しなければならない）、should（〜すべきだ）、may（〜してもよい・〜かもしれない）。",
    "助動詞の後ろは必ず動詞の原形。助動詞そのものに -s はつきません（× cans）。",
    "have to（〜しなければならない）は must とほぼ同じ意味で、主語に合わせて has to になります。"],
    ex: [["You must wear a badge.", "バッジを着用しなければならない。"], ["Could you send me the file?", "ファイルを送っていただけますか。"], ["She has to leave early today.", "彼女は今日、早く帰らなければならない。"]] },
  { tag: "完了形", lv: 2, title: "進行形と完了形", body: [
    "進行形（be ＋ -ing）は「今〜しているところ」。完了形（have ＋過去分詞）は過去から今につながることを表します。",
    "現在完了は since（〜以来）、for（〜の間）、already（もう）、yet（まだ）、ever（今までに）と相性がよい言葉です。",
    "過去のある時点より前は過去完了（had ＋過去分詞）、未来のある時点までに終わることは未来完了（will have ＋過去分詞）。"],
    ex: [["She is talking on the phone.", "彼女は電話中だ。"], ["I have worked here since 2019.", "2019年からここで働いている。"], ["The train had left before we arrived.", "私たちが着く前に電車は出ていた。"]] },
  { tag: "受動態", lv: 2, title: "受動態：〜される", body: [
    "受動態は be ＋過去分詞で「〜される」。主語が動作を受ける側のときに使います。",
    "見分け方：主語が自分でその動作をするか。報告書（The report）は自分で書かないので The report was written。",
    "空所の後ろに目的語（名詞）がなければ受動態の可能性が高い、というのが Part 5 の定番の考え方です。"],
    ex: [["The meeting was canceled.", "会議は中止された。"], ["Lunch will be served at noon.", "昼食は正午に出されます。"], ["The road is being repaired.", "道路は修理中だ。"]] },
  { tag: "不定詞・動名詞", lv: 2, title: "不定詞と動名詞", body: [
    "to ＋動詞の原形（不定詞）と動詞の -ing（動名詞）は、どちらも動詞を名詞のように使う形です。",
    "後ろに to 不定詞をとる動詞：want, decide, plan, hope, agree, expect。後ろに -ing をとる動詞：finish, enjoy, avoid, suggest, consider, mind。",
    "前置詞の後ろは必ず -ing（for helping, about moving）。look forward to -ing の to も前置詞です。"],
    ex: [["We decided to hire two more engineers.", "エンジニアをあと2人雇うことにした。"], ["He finished writing the report.", "彼は報告書を書き終えた。"], ["I look forward to working with you.", "一緒に働けるのを楽しみにしています。"]] },
  { tag: "比較", lv: 2, title: "比較：-er / -est / as 〜 as", body: [
    "2つを比べるときは比較級（larger, more useful）＋ than。3つ以上の中で一番なら最上級（the largest, the most useful）＋ in / of。",
    "長い語は more / most をつけます（more expensive）。good → better → best のような不規則な変化もあります。",
    "比較級を強めるのは much / far / even（much better）。very は使えません。as 〜 as possible（できるだけ〜）は原級のままです。"],
    ex: [["This printer is faster than the old one.", "このプリンターは古いものより速い。"], ["It is the most popular item in our store.", "当店で一番人気の商品です。"], ["Please arrive as early as possible.", "できるだけ早く到着してください。"]] },
  { tag: "前置詞・接続詞", lv: 3, title: "前置詞と接続詞の区別", body: [
    "Part 5 の頻出パターンです。意味が同じでも、後ろに名詞だけが来るなら前置詞、主語＋動詞が来るなら接続詞を選びます。",
    "〜にもかかわらず：despite / in spite of（前置詞）と although / even though（接続詞）。〜のために：because of / due to（前置詞）と because（接続詞）。〜の間：during（前置詞）と while（接続詞）。",
    "まず空所の後ろに動詞があるかを見て、次に意味で選ぶと速くて確実です。"],
    ex: [["Despite the delay, the meeting started on time.", "遅れにもかかわらず、会議は時間どおり始まった。"], ["Although it was late, she kept working.", "遅い時間だったが、彼女は働き続けた。"], ["The road was closed due to the storm.", "嵐のため道路が閉鎖された。"]] },
  { tag: "分詞", lv: 3, title: "分詞：-ing と過去分詞で名詞を説明する", body: [
    "動詞の -ing（現在分詞）と過去分詞は、形容詞のように名詞を説明できます。-ing は「〜している・〜させる」、過去分詞は「〜された」。",
    "感情の語に注意：exciting（わくわくさせる＝物）と excited（わくわくした＝人）、interesting と interested、satisfying と satisfied。",
    "名詞の後ろに置いて説明することもできます（the man standing there, products made in Japan）。"],
    ex: [["The results were surprising.", "結果は驚くべきものだった。"], ["We were surprised at the results.", "私たちは結果に驚いた。"], ["Please check the attached file.", "添付ファイルをご確認ください。"]] },
  { tag: "関係詞", lv: 3, title: "関係代名詞と関係副詞", body: [
    "関係代名詞は名詞の後ろに文をつなげて、その名詞を詳しく説明します。人なら who、物なら which、どちらにも that が使えます。",
    "後ろの文で欠けているものを見ます。主語が欠けていれば who / which、目的語が欠けていれば which / that（省略も可）、名詞の前で「その〜の」なら whose。",
    "後ろの文が欠けずに完全なら関係副詞：場所は where、時は when。what は「〜すること・もの」で先行詞を含みます。"],
    ex: [["The woman who called you is my boss.", "あなたに電話した女性は私の上司です。"], ["This is the office where I work.", "ここが私の働くオフィスです。"], ["What we need is more time.", "私たちに必要なのはもっと時間だ。"]] },
  { tag: "語彙", lv: 3, title: "語彙問題の解き方", body: [
    "選択肢の品詞が同じで意味が違うなら語彙問題です。文全体を読み、意味が通るものを選びます。",
    "ヒントはセットで使う語（コロケーション）です：meet a deadline（締め切りを守る）、comply with（〜に従う）、be responsible for（〜を担当する）。",
    "単語の練習で例のフレーズまで音読しておくと、語彙問題が一瞬で解けるようになります。"],
    ex: [["We must meet the deadline.", "締め切りを守らなければならない。"], ["Please refrain from smoking.", "おたばこはご遠慮ください。"], ["She is responsible for the budget.", "彼女は予算を担当している。"]] },
  { tag: "一致", lv: 4, title: "主語と動詞の一致", body: [
    "動詞は主語の数（単数・複数）に合わせます。主語が長いときは中心の名詞を見つけるのがコツです。The list of names is …（中心は list）。",
    "単数扱い：each, every, either, one of 〜, the number of 〜。複数扱い：a number of 〜（多くの〜）, both A and B。",
    "either A or B / neither A nor B は、動詞に近い B に合わせます。"],
    ex: [["Each of the rooms has a balcony.", "どの部屋にもバルコニーがある。"], ["The number of visitors is increasing.", "来訪者の数は増えている。"], ["A number of visitors are waiting.", "多くの来訪者が待っている。"]] },
  { tag: "仮定法", lv: 5, title: "仮定法と倒置", body: [
    "事実と違うことを仮定するときは、時制を1つ過去にずらします。今の話なら If I had 〜, I would 〜（仮定法過去）、過去の話なら If I had had 〜, I would have 〜（仮定法過去完了）。",
    "上級問題では if が省かれて語順が入れかわる形（倒置）が出ます：Should you have any questions（＝If you should have）、Had I known（＝If I had known）。",
    "It is essential / important that ＋主語＋動詞の原形、や Rarely / Never が文頭に来たときの倒置（Rarely have we seen …）も900点レベルの定番です。"],
    ex: [["If I were you, I would accept the offer.", "私があなたなら、その申し出を受けるだろう。"], ["Should you need assistance, please call us.", "お手伝いが必要でしたらお電話ください。"], ["Had we known, we would have helped.", "知っていたら手伝ったのに。"]] },
];

// Part 5：tag|レベル|文（空所は ___）|A|B|C|D|正解(0-3)|解説
const P5 = `
品詞|1|Ms. Tanaka is a very ___ teacher.|kind|kindly|kindness|kinds|0|名詞 teacher の前に入るのは形容詞 kind（親切な）。kindly は副詞、kindness は名詞。訳：田中先生はとても親切な先生だ。
品詞|1|Please speak ___ in the library.|quiet|quietly|quietness|quiets|1|動詞 speak を説明するのは副詞 quietly（静かに）。訳：図書館では静かに話してください。
品詞|2|The ___ of the new store is next Monday.|open|opened|opening|opens|2|the と of の間には名詞が入る。opening（開店）。訳：新しい店の開店は来週の月曜日だ。
品詞|2|Our team worked ___ to finish the project on time.|hard|hardly|hardness|hardy|0|work hard で「一生懸命働く」。hard はこの形のまま副詞。hardly は「ほとんど〜ない」で意味が違う。訳：私たちのチームは期限内に終えるため懸命に働いた。
品詞|3|The manager gave a ___ explanation of the new policy.|clear|clearly|clarity|clearing|0|名詞 explanation の前は形容詞 clear。clearly は副詞、clarity は名詞。訳：部長は新しい方針をわかりやすく説明した。
品詞|3|Applicants must submit their forms ___ by Friday.|electronic|electronically|electronics|electrician|1|動詞＋目的語（submit their forms）の後ろで動詞を説明するのは副詞。訳：応募者は金曜日までに用紙を電子的に提出しなければならない。
品詞|3|We are pleased to announce the ___ of our new branch in Osaka.|establish|established|establishment|establishes|2|the と of の間は名詞。establishment（設立）。訳：大阪に新支店を設立したことをお知らせします。
品詞|4|The new software has ___ reduced the time needed to process orders.|significant|significantly|significance|signify|1|has と過去分詞 reduced の間に入り、動詞を説明するのは副詞。訳：新しいソフトは注文処理にかかる時間を大幅に減らした。
品詞|4|Ms. Lee is known for her ___ to detail.|attentive|attention|attend|attentively|1|所有格 her の後ろは名詞。attention to detail（細部への注意）。訳：リーさんは細部に気を配ることで知られている。
品詞|4|All employees are required to attend a ___ safety training session.|mandate|mandatory|mandatorily|mandates|1|冠詞 a と名詞の間に入るのは形容詞 mandatory（必須の）。訳：全従業員は必須の安全研修に出席しなければならない。
品詞|5|The board was ___ impressed by the proposal's focus on cost control.|favorable|favorably|favor|favored|1|be動詞と過去分詞 impressed の間で impressed を説明するのは副詞 favorably（好意的に）。訳：取締役会は、コスト管理を重視した提案に好印象を持った。
品詞|5|Due to ___ demand, the exhibition has been extended for two more weeks.|overwhelm|overwhelming|overwhelmingly|overwhelms|1|名詞 demand を説明する形容詞 overwhelming（圧倒的な）。訳：圧倒的な需要のため、展示会はさらに2週間延長された。
be動詞|1|My brother ___ a doctor.|is|are|am|be|0|主語 My brother は3人称単数なので is。訳：私の兄は医者だ。
be動詞|1|They ___ in the meeting room now.|is|am|are|be|2|主語 They には are。訳：彼らは今、会議室にいる。
be動詞|1|Mr. Sato ___ to work by train every day.|go|goes|going|is go|1|主語が3人称単数で現在の習慣なので goes。be動詞と一般動詞は並べない（is go は誤り）。訳：佐藤さんは毎日電車で通勤している。
be動詞|1|___ you busy this afternoon?|Do|Are|Is|Does|1|busy（形容詞）の文は be動詞で疑問文を作る。主語 you なので Are。訳：今日の午後は忙しいですか。
be動詞|1|She ___ not like coffee.|is|does|do|are|1|like は一般動詞なので否定は does not。主語 She は3人称単数。訳：彼女はコーヒーが好きではない。
be動詞|1|The store ___ closed on Sundays.|is|does|do|are|0|closed（閉まっている）は形容詞の働きなので be動詞。主語は単数なので is。訳：その店は日曜日は閉まっている。
時制|1|I ___ to Kyoto last week.|go|went|will go|goes|1|last week（先週）は過去なので過去形 went。訳：私は先週、京都へ行った。
時制|1|We ___ a meeting tomorrow morning.|had|have had|will have|has|2|tomorrow（明日）は未来なので will have。訳：明日の朝、会議がある。
時制|1|She usually ___ lunch at noon.|eat|eats|ate|eating|1|usually（ふだん）は現在の習慣。主語 She は3人称単数なので eats。訳：彼女はふだん正午に昼食をとる。
時制|2|The train ___ when we arrived at the station.|is leaving|has already left|had already left|leaves|2|「着いた（過去）」ときにはもう出ていた。過去より前のことは過去完了 had left。訳：私たちが駅に着いたとき、電車はすでに出ていた。
時制|2|Mr. Kim ___ for this company since 2015.|works|worked|has worked|will work|2|since 2015（2015年から今まで）は現在完了 has worked。訳：キムさんは2015年からこの会社で働いている。
時制|3|By the time the conference begins, we ___ all the materials.|prepare|prepared|will have prepared|have been preparing|2|By the time ＋現在形（未来の時点）までに完了していること → 未来完了。訳：会議が始まるまでに、資料はすべて準備し終えているだろう。
時制|3|The marketing team ___ the results of the survey next Tuesday.|announced|will announce|has announced|announcing|1|next Tuesday（来週の火曜日）は未来。訳：マーケティングチームは来週火曜日に調査結果を発表する。
時制|3|If it ___ tomorrow, the outdoor event will be moved indoors.|rains|will rain|rained|raining|0|時・条件を表す if 節では、未来のことでも現在形を使う。訳：明日雨が降ったら、屋外イベントは屋内に移される。
時制|4|Ms. Rivera ___ the sales department for three years before she was promoted.|has managed|had managed|manages|will manage|1|昇進した（過去）より前の3年間 → 過去完了 had managed。訳：リベラさんは昇進する前、3年間営業部を管理していた。
代名詞|1|This is ___ new office.|we|our|us|ours|1|名詞 office の前は所有格 our。訳：ここが私たちの新しいオフィスだ。
代名詞|1|Please call ___ tomorrow.|I|my|me|mine|2|動詞 call の目的語は目的格 me。訳：明日、私に電話してください。
代名詞|1|That bag is not mine. It is ___.|her|hers|she|herself|1|「彼女のもの」は所有代名詞 hers。訳：あのかばんは私のではない。彼女のものだ。
代名詞|2|Mr. Brown repaired the printer ___.|him|his|himself|he|2|「自分で」は再帰代名詞 himself。訳：ブラウンさんは自分でプリンターを修理した。
代名詞|3|Employees who wish to attend the seminar should register ___ names by Friday.|they|their|them|theirs|1|名詞 names の前は所有格 their。訳：セミナーに出たい従業員は金曜日までに名前を登録すること。
代名詞|3|The two companies agreed to share ___ research data.|its|their|them|theirs|1|主語 The two companies は複数なので their。訳：2社は研究データを共有することで合意した。
代名詞|4|Ms. Park prefers to review the contracts ___ rather than ask her assistant.|her|hers|herself|she|2|「自分自身で」は herself。訳：パクさんは助手に頼むより、自分で契約書を確認するほうを好む。
前置詞|1|The meeting starts ___ 10 o'clock.|at|on|in|for|0|時刻の前は at。訳：会議は10時に始まる。
前置詞|1|The store is closed ___ Sunday.|in|at|on|by|2|曜日の前は on。訳：その店は日曜日が休みだ。
前置詞|1|I was born ___ 1995.|on|in|at|to|1|年の前は in。訳：私は1995年に生まれた。
前置詞|2|Please submit the report ___ Friday.|by|until|since|during|0|「〜までに」（期限）は by。until は「〜までずっと」。訳：金曜日までに報告書を提出してください。
前置詞|2|The office will be closed ___ the holidays.|while|during|between|since|1|名詞 the holidays の前で「〜の間」は前置詞 during。while は接続詞で、後ろに主語と動詞が来る。訳：休暇中、事務所は閉まる。
前置詞|2|Our store is located ___ the bank and the post office.|among|between|through|across|1|「AとBの間」は between A and B。訳：当店は銀行と郵便局の間にある。
前置詞|3|The museum is open daily ___ 9 A.M. to 5 P.M.|from|since|at|between|0|from A to B（AからBまで）。between なら and を使う。訳：美術館は毎日午前9時から午後5時まで開いている。
前置詞|3|Customers can return items ___ 30 days of purchase.|within|during|by|until|0|「〜以内に」は within。訳：お客様は購入から30日以内なら返品できる。
助動詞|2|You ___ wear a helmet in the factory.|must|can't|would|may not|0|安全のための決まりなので must（〜しなければならない）。訳：工場ではヘルメットを着用しなければならない。
助動詞|2|___ I use your phone?|May|Must|Have|Will|0|許可を求めるのは May I 〜?（〜してもいいですか）。訳：電話をお借りしてもいいですか。
助動詞|2|Mr. Lopez ___ speak three languages.|can|cans|can to|is can|0|助動詞の後ろは動詞の原形。助動詞の形は変わらない（cans, can to は誤り）。訳：ロペスさんは3か国語を話せる。
助動詞|2|You ___ to bring your ID card tomorrow.|must|have|should|can|1|have to ＋動詞の原形で「〜しなければならない」。must や should の後ろに to は来ない。訳：明日は身分証を持ってくる必要がある。
助動詞|3|Visitors ___ not park in the spaces reserved for staff.|should|have|has|are|0|後ろが not park（原形）なので助動詞 should。訳：来客は職員用の駐車スペースにとめないでください。
完了形|2|I have ___ finished my report.|already|yet|ever|since|0|現在完了の肯定文で「もう〜した」は already。yet は否定文・疑問文で使う。訳：私はもう報告書を書き終えた。
完了形|2|Have you ___ been to Canada?|ever|already|yet|never|0|経験をたずねるのは Have you ever 〜?。訳：カナダに行ったことはありますか。
完了形|2|She is ___ a presentation right now.|give|giving|gave|given|1|is ＋ -ing で「今〜している」（進行形）。訳：彼女はちょうど今、発表をしているところだ。
完了形|3|The company has ___ its profits every year since 2020.|increase|increased|increasing|increases|1|has ＋過去分詞で現在完了。訳：その会社は2020年から毎年利益を伸ばしてきた。
完了形|3|We ___ the new system for six months, and it works well.|use|are used|have been using|had used|2|6か月前から今までずっと使っている → 現在完了進行形。訳：新システムを6か月使っていて、うまく動いている。
受動態|2|This bridge ___ in 1990.|built|was built|is building|builds|1|橋は「建てられた」→ 受動態 was built。訳：この橋は1990年に建てられた。
受動態|2|English ___ in many countries.|speaks|is spoken|is speaking|spoke|1|英語は「話される」→ is spoken。訳：英語は多くの国で話されている。
受動態|3|All visitors are ___ to sign in at the front desk.|require|required|requiring|requirement|1|be required to 〜（〜するよう求められる）。訳：来訪者は全員、受付で記帳する必要がある。
受動態|3|The package will ___ to your home within three days.|deliver|be delivered|delivering|be delivering|1|荷物は「配達される」→ will be delivered。訳：荷物は3日以内にご自宅に届けられる。
受動態|4|The annual report ___ by the accounting department at the moment.|is reviewing|is being reviewed|reviews|has reviewed|1|「今まさに確認されているところ」→ 進行形の受動態 is being reviewed。訳：年次報告書は今、経理部が確認しているところだ。
受動態|4|Ms. Chen ___ the employee of the year award last month for her excellent work.|was given|gave|was giving|has given|0|彼女は賞を「与えられた」→ 受動態 was given。目的語（award）が残る形の受動態。訳：チェンさんは優れた働きにより、先月年間最優秀社員賞を贈られた。
不定詞・動名詞|2|I want ___ a new car.|buy|to buy|buying|bought|1|want の後ろは to 不定詞。want to 〜（〜したい）。訳：新しい車を買いたい。
不定詞・動名詞|2|Thank you for ___ me.|help|to help|helping|helped|2|前置詞 for の後ろは動名詞（-ing）。訳：手伝ってくれてありがとう。
不定詞・動名詞|3|Mr. Hall finished ___ the documents before lunch.|check|to check|checking|checked|2|finish の後ろは動名詞。finish -ing（〜し終える）。訳：ホールさんは昼食前に書類の確認を終えた。
不定詞・動名詞|3|The company decided ___ a new factory in Vietnam.|to open|opening|open|opened|0|decide の後ろは to 不定詞。訳：その会社はベトナムに新工場を開くことに決めた。
不定詞・動名詞|4|We look forward to ___ you at the conference.|see|seeing|seen|be seen|1|look forward to の to は前置詞なので後ろは動名詞。訳：会議でお会いできるのを楽しみにしています。
不定詞・動名詞|4|Ms. Ito suggested ___ the meeting until next week.|postpone|to postpone|postponing|postponed|2|suggest の後ろは動名詞（to 不定詞は不可）。訳：伊藤さんは会議を来週まで延期することを提案した。
不定詞・動名詞|5|The new policy is designed ___ costs without reducing quality.|to lower|lowering|lowered|lowers|0|be designed to 〜（〜するために作られている）。訳：新方針は、質を落とさずにコストを下げるためのものだ。
比較|2|This room is ___ than that one.|large|larger|largest|more large|1|than があるので比較級 larger。訳：この部屋はあの部屋より広い。
比較|2|Mt. Fuji is the ___ mountain in Japan.|high|higher|highest|more high|2|the ＋最上級＋ in 〜（〜で一番…）。訳：富士山は日本で一番高い山だ。
比較|3|The new model is ___ more efficient than the old one.|very|much|many|so|1|比較級を強めるのは much（ずっと）。very は比較級を強められない。訳：新モデルは旧モデルよりずっと効率がよい。
比較|3|Please reply as ___ as possible.|soon|sooner|soonest|more soon|0|as 〜 as possible（できるだけ〜）は原級。訳：できるだけ早く返信してください。
比較|4|This year's sales were ___ than expected.|high|higher|highest|highly|1|than があるので比較級 higher。訳：今年の売上は予想より多かった。
比較|4|Of the three proposals, Mr. Grant's was the ___ detailed.|more|most|much|very|1|3つの中で一番 → 最上級 the most。訳：3つの提案のうち、グラントさんのものが最も詳しかった。
前置詞・接続詞|3|___ the bad weather, the event was held as planned.|Although|Despite|Because|Even if|1|後ろが名詞（the bad weather）だけなので前置詞 Despite。Although は接続詞で、主語＋動詞が続く。訳：悪天候にもかかわらず、イベントは予定どおり行われた。
前置詞・接続詞|3|___ it was raining, the event was held as planned.|Despite|Although|Because of|In spite of|1|後ろに主語＋動詞（it was raining）があるので接続詞 Although。訳：雨が降っていたが、イベントは予定どおり行われた。
前置詞・接続詞|3|The flight was delayed ___ heavy snow.|because|because of|so|although|1|後ろが名詞なので前置詞句 because of。訳：大雪のため飛行機が遅れた。
前置詞・接続詞|4|Please wait in the lobby ___ your name is called.|until|by|during|for|0|後ろが主語＋動詞なので接続詞 until（〜するまで）。by と during は前置詞。訳：名前が呼ばれるまでロビーでお待ちください。
前置詞・接続詞|4|___ you have any questions, please contact our support team.|If|Unless|Despite|During|0|「もし質問があれば」→ If。Unless だと「質問がない限り」となり意味が合わない。訳：ご質問があればサポートチームにご連絡ください。
前置詞・接続詞|4|___ his lack of experience, Mr. Ford was hired because of his strong skills.|Although|Despite|Unless|Whereas|1|後ろが名詞句なので前置詞 Despite。訳：経験不足にもかかわらず、フォードさんは高い技能を評価されて採用された。
前置詞・接続詞|5|___ the renovation is complete, the lobby will remain closed.|Until|Once|During|Despite|0|「改装が終わるまで閉鎖されたまま」→ Until。Once（〜したら）では意味が合わず、During と Despite は前置詞。訳：改装が終わるまで、ロビーは閉鎖される。
前置詞・接続詞|5|The seminar was canceled ___ a lack of registrations.|owing to|so that|even though|as if|0|後ろが名詞句なので前置詞句 owing to（〜のために）。ほかは接続詞。訳：申込者不足のため、セミナーは中止になった。
前置詞・接続詞|5|Employees may work from home ___ they complete their tasks on time.|as long as|in case of|regardless of|due to|0|後ろに主語＋動詞があるので接続詞 as long as（〜する限り）。ほかは前置詞句。訳：期限どおりに仕事を終える限り、在宅勤務をしてよい。
前置詞・接続詞|6|___ having limited funding, the research team made remarkable progress.|Although|Despite|Even though|Whereas|1|動名詞 having の前に置けるのは前置詞 Despite。ほかは接続詞で主語＋動詞が必要。訳：資金が限られていたにもかかわらず、研究チームはめざましい進歩を遂げた。
分詞|3|The movie was very ___.|excite|exciting|excited|excitement|1|映画が人を「わくわくさせる」→ exciting。excited は人が「わくわくした」。訳：その映画はとてもわくわくするものだった。
分詞|3|We were ___ with the hotel's service.|satisfy|satisfying|satisfied|satisfaction|2|人が「満足させられた」→ satisfied。訳：私たちはホテルのサービスに満足した。
分詞|4|The man ___ next to Ms. Wong is our new director.|stand|standing|stood|stands|1|「ウォンさんの隣に立っている男性」→ 現在分詞 standing が後ろから名詞を説明。訳：ウォンさんの隣に立っている男性が新しい部長だ。
分詞|4|Please read the ___ document before the meeting.|attach|attaching|attached|attachment|2|書類は「添付された」→ 過去分詞 attached。訳：会議の前に添付の書類を読んでください。
分詞|5|___ in 1920, the hotel is one of the oldest buildings in the city.|Build|Building|Built|To build|2|ホテルは「建てられた」→ 受け身の意味の分詞構文は過去分詞 Built。訳：1920年に建てられたそのホテルは、市内で最も古い建物の1つだ。
分詞|5|Products ___ during the sale cannot be exchanged.|purchase|purchasing|purchased|purchases|2|製品は「購入される」側 → 過去分詞 purchased が後ろから説明。訳：セール中に購入された商品は交換できない。
関係詞|3|I have a friend ___ lives in London.|who|which|whose|where|0|先行詞が人（a friend）で、後ろに主語がない → 主格の who。訳：ロンドンに住んでいる友人がいる。
関係詞|3|This is the book ___ I bought yesterday.|who|which|where|whose|1|先行詞が物で、bought の目的語が欠けている → which。訳：これは昨日買った本だ。
関係詞|4|The hotel ___ we stayed was near the beach.|which|where|who|what|1|stayed の後ろで欠けているのは場所。文としては完全なので関係副詞 where。訳：私たちが泊まったホテルは海辺の近くだった。
関係詞|4|We are looking for a candidate ___ experience includes project management.|who|whose|which|whom|1|名詞 experience の前で「その人の」→ 所有格 whose。訳：プロジェクト管理の経験がある候補者を探している。
関係詞|5|___ wins the contest will receive a free trip to Hawaii.|Whoever|Whatever|Whichever|However|0|「〜する人は誰でも」で文の主語になる → Whoever。訳：コンテストで優勝した人はハワイ旅行を無料でもらえる。
関係詞|5|The report clearly shows ___ the company needs to fix first.|what|which|who|that|0|shows の目的語で、fix の目的語も欠けている → 先行詞を含む what（〜こと）。訳：報告書は、会社がまず直すべきことをはっきり示している。
語彙|3|Please ___ the attached form and return it by Friday.|complete|attend|arrive|happen|0|form を目的語にとって「用紙に記入する」は complete。訳：添付の用紙に記入し、金曜日までに返送してください。
語彙|3|The hotel offers ___ breakfast to all guests.|complimentary|punctual|confident|frequent|0|「無料の朝食」は complimentary breakfast。訳：ホテルは全宿泊客に無料の朝食を出している。
語彙|3|We need to ___ a meeting room for Thursday.|reserve|deserve|preserve|observe|0|会議室を「予約する」は reserve。形の似た語に注意。訳：木曜日の会議室を予約する必要がある。
語彙|3|Our new product will be ___ next month.|launched|lunched|landed|lent|0|新製品を「発売する」は launch。訳：新製品は来月発売される。
語彙|4|The deadline for the project has been ___ to May 30.|extended|expanded|exceeded|expected|0|締め切りを「延長する」は extend。expand は規模を広げること。訳：プロジェクトの締め切りは5月30日まで延長された。
語彙|4|Ms. Ortiz is ___ for training new employees.|responsible|reliable|reasonable|respective|0|be responsible for 〜（〜を担当している）。訳：オルティスさんは新入社員の研修を担当している。
語彙|4|All employees must ___ with the new safety regulations.|comply|obey|follow|observe|0|後ろに with があるのは comply（comply with 〜に従う）。obey, follow, observe は with をとらない。訳：全従業員は新しい安全規則に従わなければならない。
語彙|4|The store will offer a 20 percent ___ on all items this weekend.|discount|account|amount|count|0|「20%引き」は a 20 percent discount。訳：その店は今週末、全商品を20%引きにする。
語彙|5|The company plans to ___ its operations into two new markets next year.|expand|explain|exceed|expire|0|事業を新しい市場へ「拡大する」は expand A into B。訳：その会社は来年、事業を2つの新市場に広げる予定だ。
語彙|5|The new manager quickly established a good ___ with her team.|rapport|report|support|resort|0|「〜とよい信頼関係を築く」は establish a good rapport with 〜。訳：新しい部長はすぐにチームとよい信頼関係を築いた。
語彙|5|Due to ___ weather, the outdoor concert has been postponed.|inclement|incumbent|inaugural|indispensable|0|「荒天」は inclement weather。訳：悪天候のため、野外コンサートは延期された。
語彙|6|Salary will be ___ with experience and qualifications.|commensurate|competent|complacent|compulsory|0|be commensurate with 〜（〜に見合った）。訳：給与は経験と資格に見合った額となる。
語彙|6|The CEO's speech ___ the importance of customer satisfaction.|underscored|undertook|underwent|underpaid|0|「重要性を強調した」→ underscore。undertake は引き受ける、undergo は経験する。訳：CEOの演説は顧客満足の重要性を強調した。
語彙|6|Please ___ from using mobile phones during the performance.|refrain|restrain|prevent|avoid|0|後ろに from が続き「〜を控える」は refrain from。avoid なら avoid using で from は不要。訳：公演中は携帯電話のご使用をお控えください。
一致|4|The list of participants ___ been sent to all managers.|has|have|having|are|0|主語の中心は The list（単数）なので has。of participants にまどわされない。訳：参加者名簿は全部長に送られた。
一致|4|Each of the rooms ___ a view of the ocean.|have|has|having|are having|1|Each of 〜 は単数扱いなので has。訳：どの部屋からも海が見える。
一致|5|Neither the manager nor the employees ___ aware of the change.|was|were|is|has been|1|neither A nor B は B（the employees＝複数）に合わせて were。訳：部長も従業員もその変更を知らなかった。
一致|5|A number of customers ___ complained about the delay.|has|have|is|was|1|a number of 〜（多くの〜）は複数扱いなので have。訳：多くの客が遅延について苦情を言った。
仮定法|5|If I ___ more time, I would travel around the world.|have|had|will have|would have|1|今の事実と違う仮定は過去形（仮定法過去）。訳：もっと時間があれば世界中を旅するのに。
仮定法|5|If we had left earlier, we ___ the train.|would catch|would have caught|will catch|caught|1|過去の事実と違う仮定（had left）には would have ＋過去分詞（仮定法過去完了）。訳：もっと早く出ていれば電車に間に合ったのに。
仮定法|6|___ you have any questions, please do not hesitate to contact us.|Should|Would|Had|Were|0|If you should have 〜 の if を省いた倒置 Should you have 〜。訳：ご質問があれば、ご遠慮なくお問い合わせください。
仮定法|6|___ the weather been better, the event would have attracted more visitors.|If|Had|Were|Should|1|If the weather had been 〜 の倒置 Had the weather been 〜。訳：天気がもっとよければ、イベントにはもっと人が集まっただろう。
仮定法|6|It is essential that every employee ___ the training by June 30.|complete|completes|completed|completing|0|essential / important that 〜 の that 節では動詞の原形（仮定法現在）。訳：全従業員が6月30日までに研修を修了することが不可欠だ。
仮定法|6|Rarely ___ such strong demand for a new product.|we have seen|have we seen|we saw|seen we have|1|否定の副詞 Rarely が文頭に来ると倒置（have we seen）になる。訳：新製品にこれほど強い需要があるのはめったに見たことがない。
`;

// Part 2：レベル|質問|応答1|応答2|応答3|正解(0-2)|訳と解き方（選択肢の順番は出題時に入れかわる）
const P2 = `
1|Where is the station?|It's next to the bank.|At three o'clock.|Yes, it is.|0|駅はどこですか。→ 銀行の隣です。Where には場所で答える。
1|What time does the store open?|At nine o'clock.|In the shopping mall.|I bought some milk.|0|店は何時に開きますか。→ 9時です。
1|Who is your teacher?|Ms. Brown is.|In Room 5.|Every Monday.|0|あなたの先生は誰ですか。→ ブラウン先生です。Who には人で答える。
1|How are you today?|I'm fine, thank you.|By bus.|It's ten dollars.|0|今日の調子はどうですか。→ 元気です、ありがとう。
1|Is this your bag?|Yes, it's mine.|It's on the table.|I'd like a new one.|0|これはあなたのかばんですか。→ はい、私のものです。
1|When is the meeting?|On Friday afternoon.|In the conference room.|Mr. Lee will.|0|会議はいつですか。→ 金曜日の午後です。When には時で答える。
1|How much is this shirt?|It's twenty dollars.|It's blue.|Size medium.|0|このシャツはいくらですか。→ 20ドルです。
1|Do you like coffee?|Yes, very much.|At the cafe.|Two sugars.|0|コーヒーは好きですか。→ はい、とても。
2|Why was the train late?|Because of the heavy snow.|At platform 4.|It leaves at six.|0|なぜ電車は遅れたのですか。→ 大雪のためです。
2|Could you help me carry these boxes?|Sure, where do they go?|Yes, they're heavy boxes.|I bought them yesterday.|0|この箱を運ぶのを手伝ってもらえますか。→ いいですよ、どこに運びますか。質問の語（boxes）をくり返す選択肢はひっかけが多い。
2|Would you like some tea?|Yes, please.|I'd like to go.|No, it's Tuesday.|0|お茶はいかがですか。→ はい、お願いします。
2|Which bus goes to the airport?|The number 15.|About thirty minutes.|At the airport.|0|どのバスが空港に行きますか。→ 15番です。同じ語（airport）を使った選択肢に注意。
2|Who's in charge of the new project?|Mr. Tanaka is.|It's a new project.|Next month.|0|新しいプロジェクトの担当は誰ですか。→ 田中さんです。
2|How long does it take to get there?|About twenty minutes by car.|It's very long.|Turn left at the corner.|0|そこへ行くのにどれくらいかかりますか。→ 車で約20分です。
2|Have you finished the report?|Almost. I'll send it soon.|Yes, a long report.|He reported it.|0|報告書は終わりましたか。→ もうすぐです。すぐ送ります。
2|Where should I put these files?|On my desk, please.|They're important files.|Yesterday morning.|0|これらのファイルはどこに置けばいいですか。→ 私の机の上にお願いします。
3|When will the new manager start?|Not until next month.|At the main office.|She's very experienced.|0|新しい部長はいつから来ますか。→ 来月になってからです。
3|Why don't we take a break?|Good idea. I'm tired.|Because it's broken.|I didn't take it.|0|休憩しませんか。→ いいですね、疲れました。Why don't we 〜? は理由ではなく提案。
3|Do you know where the meeting room is?|It's on the third floor.|Yes, I know the meeting.|At two o'clock.|0|会議室がどこか知っていますか。→ 3階です。Do you know where 〜? には場所で答えるのが自然。
3|Should I call the client now or later?|Now would be better.|She called yesterday.|Yes, you should.|0|今、顧客に電話すべきですか、後にすべきですか。→ 今のほうがいいでしょう。A or B の質問に Yes/No では答えない。
3|The printer isn't working again.|I'll call the repair service.|I printed it this morning.|It works for a company.|0|プリンターがまた動きません。→ 修理業者に電話します。質問でない文には対応を答える。
3|How did the presentation go?|Very well, thanks.|It goes to Room B.|By train.|0|発表はどうでしたか。→ とてもうまくいきました。
3|Isn't the store open on Sundays?|Only in the afternoon.|I didn't buy anything.|It's next to the bank.|0|その店は日曜日は開いていないのですか。→ 午後だけ開いています。
3|Who should I give this invoice to?|The accounting department handles that.|I gave it a try.|By next Friday.|0|この請求書は誰に渡せばいいですか。→ 経理部が担当しています。人名でなく部署で答える型。
3|Can I park my car here?|Only for fifteen minutes.|It's a new car.|The park is near here.|0|ここに車をとめてもいいですか。→ 15分だけなら。似た音（park）のひっかけに注意。
3|What did you think of the new design?|I liked the colors.|I'll design it.|About an hour ago.|0|新しいデザインをどう思いましたか。→ 色が気に入りました。
4|When is the shipment expected to arrive?|It should be here by Thursday.|To the warehouse.|We shipped it ourselves.|0|荷物はいつ届く予定ですか。→ 木曜日までには届くはずです。
4|Why hasn't the budget been approved yet?|The director is still reviewing it.|About fifty thousand dollars.|Yes, I approve.|0|なぜ予算はまだ承認されていないのですか。→ 部長がまだ検討中です。
4|Would you mind closing the window?|Not at all.|Yes, it's closed on Mondays.|I don't mind the rain.|0|窓を閉めていただけますか。→ いいですよ。Would you mind 〜? に「かまわない」と答えるのは Not at all。
4|Where can I find the instruction manual?|It's in the top drawer.|Follow the instructions.|I found it interesting.|0|取扱説明書はどこにありますか。→ 一番上の引き出しです。
4|Has the conference room been reserved?|I'll check the schedule.|It's a large room.|Yes, the conference was great.|0|会議室は予約されていますか。→ 予定表を確認します。「確認します」「わかりません」も正解になる。
4|Are you going to the trade show or staying here?|I haven't decided yet.|Yes, it was a great show.|At the convention center.|0|見本市に行きますか、ここに残りますか。→ まだ決めていません。
4|How often is the equipment inspected?|Every three months.|For about an hour.|By a technician.|0|機器はどのくらいの頻度で点検されますか。→ 3か月ごとです。How often は頻度。
4|We're running out of paper.|I placed an order this morning.|It's on the paper.|He runs every day.|0|紙がなくなりそうです。→ 今朝、注文しておきました。
4|Who will be leading the training session?|It hasn't been decided yet.|In the training room.|For new employees.|0|研修は誰が担当しますか。→ まだ決まっていません。
4|Didn't you receive my e-mail?|Sorry, I haven't checked my inbox.|Yes, I sent it.|The mail carrier comes at noon.|0|私のメールを受け取っていませんか。→ すみません、受信箱を見ていません。
5|Do you want me to forward the report to the client?|Let's wait until it's been revised.|It's a quarterly report.|I'll go forward.|0|報告書を顧客に転送しましょうか。→ 修正されるまで待ちましょう。
5|Why don't you ask Ms. Kim for help with the spreadsheet?|She's out of the office this week.|Because it's a spreadsheet.|Yes, she asked me.|0|表計算のことでキムさんに助けてもらっては。→ 彼女は今週不在です。できない理由を答える間接的な応答。
5|The quarterly figures look better than expected.|The new marketing campaign must have helped.|It's a quarter past ten.|I expected you earlier.|0|四半期の数字は予想よりよいですね。→ 新しい販促キャンペーンが効いたのでしょう。
5|How soon can you get the estimate to us?|By the end of the day.|It's an accurate estimate.|We got it from the supplier.|0|見積もりはいつまでにもらえますか。→ 今日中に。How soon は「どのくらい早く」。
5|Isn't Mr. Patel supposed to be leading this meeting?|His flight was delayed.|Yes, the meeting room is ready.|He's a good leader.|0|パテルさんがこの会議を進行するはずでは。→ 彼の便が遅れたのです。
5|Should we hire a temporary worker or ask the current staff to work overtime?|The budget won't cover overtime.|She works temporarily.|We hired him last year.|0|臨時職員を雇うか、今の職員に残業を頼むか。→ 残業代は予算でまかなえません（だから臨時職員を）。
6|I can't believe the merger was called off.|The terms just weren't favorable.|We merged onto the highway.|Please call me back.|0|合併が中止になったなんて信じられません。→ 条件がよくなかったんですよ。
6|Whose turn is it to update the client database?|Check the rotation chart on the wall.|It turns left here.|The data is updated.|0|顧客データベースの更新は誰の番ですか。→ 壁の当番表を見てください。
6|Will the renovation be finished before the inspection?|That depends on the contractor.|The inspector was satisfied.|It's a big renovation.|0|改装は検査の前に終わりますか。→ 業者次第です。
`;

// Part 3・4：W は女性、M は男性の声で読む。kind: conv 会話 / talk 説明文。a は c の正解番号
const P34 = [
  { lv: 1, kind: "conv", lines: [["W", "Hi. I'd like a coffee, please."], ["M", "Sure. Small or large?"], ["W", "Large, please. How much is it?"], ["M", "It's three dollars. Would you like anything else?"], ["W", "No, thank you."]],
    ja: "女性がコーヒーのLサイズを注文し、店員が3ドルだと伝える会話。",
    qs: [{ q: "Where are the speakers?", c: ["At a coffee shop", "At a bank", "At a hotel", "At a train station"], a: 0, ex: "コーヒーを注文しているので、コーヒー店。" },
      { q: "What size does the woman want?", c: ["Small", "Medium", "Large", "Extra large"], a: 2, ex: "Large, please. と言っている。" },
      { q: "How much is the coffee?", c: ["Two dollars", "Three dollars", "Four dollars", "Thirteen dollars"], a: 1, ex: "It's three dollars. と言っている。three と thirteen の聞き分けに注意。" }] },
  { lv: 2, kind: "conv", lines: [["M", "Hi, Lisa. Is the sales meeting still at two o'clock?"], ["W", "No, it was moved to four. Mr. Green has a client visit this afternoon."], ["M", "I see. Is it still in Room B?"], ["W", "Yes, same room. Can you bring the sales report?"], ["M", "Sure, I'll print it now."]],
    ja: "営業会議はグリーンさんの顧客訪問のため4時に変更。場所はB室のまま。男性が報告書を印刷する。",
    qs: [{ q: "What time is the meeting now?", c: ["At two o'clock", "At three o'clock", "At four o'clock", "At five o'clock"], a: 2, ex: "it was moved to four（4時に変更された）。" },
      { q: "Why was the meeting moved?", c: ["Room B is not available.", "Mr. Green has a client visit.", "The report is not ready.", "The woman is sick."], a: 1, ex: "Mr. Green has a client visit this afternoon. が理由。" },
      { q: "What will the man do next?", c: ["Call Mr. Green", "Visit a client", "Print a report", "Reserve a room"], a: 2, ex: "I'll print it now.（今、印刷します）。最後のせりふは「次に何をするか」のヒント。" }] },
  { lv: 2, kind: "talk", lines: [["M", "Attention, shoppers."], ["M", "Today only, all shoes on the second floor are thirty percent off."], ["M", "Please note that our store will close at eight o'clock tonight, one hour earlier than usual."], ["M", "Thank you for shopping with us."]],
    ja: "本日限り、2階の靴が全品30%引き。今夜はいつもより1時間早い8時に閉店する。",
    qs: [{ q: "Where is the announcement being made?", c: ["In a store", "At an airport", "In a library", "On a train"], a: 0, ex: "Attention, shoppers.（お買い物中のみなさま）から店内放送とわかる。" },
      { q: "What is on sale?", c: ["Bags", "Shoes", "Coats", "Watches"], a: 1, ex: "all shoes on the second floor are thirty percent off" },
      { q: "What is different about today?", c: ["The store will open late.", "The store will close early.", "The second floor is closed.", "Parking is free."], a: 1, ex: "one hour earlier than usual（いつもより1時間早く）閉店する。" }] },
  { lv: 3, kind: "conv", lines: [["W", "Hello, this is Karen Diaz from Lakeside Dental. We ordered printer ink from you last week, but it hasn't arrived yet."], ["M", "I'm sorry about that, Ms. Diaz. Let me check. It looks like the shipment was delayed because of the snowstorm."], ["W", "We really need it by Friday. We're printing forms for our patients."], ["M", "I can send a new box by express delivery at no extra charge. It'll arrive tomorrow."], ["W", "That would be great. Thank you."]],
    ja: "歯科医院のディアスさんが、届かないインクについて電話。雪嵐で遅れていたため、男性が追加料金なしの速達で翌日届けると申し出る。",
    qs: [{ q: "Why is the woman calling?", c: ["To place a new order", "To report a late delivery", "To cancel an appointment", "To ask about prices"], a: 1, ex: "注文したインクがまだ届かない、と連絡している。" },
      { q: "What caused the delay?", c: ["A wrong address", "A snowstorm", "A computer problem", "A holiday"], a: 1, ex: "because of the snowstorm（雪嵐のため）。" },
      { q: "What does the man offer to do?", c: ["Give a refund", "Send an item by express delivery for free", "Call the delivery company", "Visit the dental office"], a: 1, ex: "at no extra charge（追加料金なしで）→ for free の言い換え。" }] },
  { lv: 3, kind: "talk", lines: [["W", "Hi, Mr. Wilson. This is Amy from Parkview Apartments."], ["W", "I'm calling about the apartment you visited on Saturday."], ["W", "The owner has agreed to lower the rent to twelve hundred dollars a month."], ["W", "If you're still interested, please call me back by Wednesday so I can prepare the lease."], ["W", "My number is 555-0182."]],
    ja: "不動産のエイミーからの留守電。オーナーが家賃を月1,200ドルに下げることに同意した。興味があれば、契約書を準備するので水曜日までに折り返し電話がほしい。",
    qs: [{ q: "Who most likely is the speaker?", c: ["A real estate agent", "A bank clerk", "A building inspector", "A moving company worker"], a: 0, ex: "内見したアパートや賃貸契約（lease）の話なので不動産業者。" },
      { q: "What has changed?", c: ["The move-in date", "The rent", "The size of the apartment", "The parking fee"], a: 1, ex: "lower the rent（家賃を下げる）。" },
      { q: "What is the listener asked to do by Wednesday?", c: ["Sign the lease", "Visit the apartment again", "Return the call", "Pay a deposit"], a: 2, ex: "call me back → return the call の言い換え。" }] },
  { lv: 4, kind: "conv", lines: [["M", "Jenna, have you had a chance to look at the résumés for the marketing position?"], ["W", "Yes. I think two of the candidates are very strong. Both have experience with social media campaigns."], ["M", "Great. Can you set up interviews with them for next week?"], ["W", "Sure. But I'm out of the office on Monday and Tuesday for the trade show in Chicago."], ["M", "Then let's do them on Thursday. I'll ask Robert to join us, since the new hire will be on his team."]],
    ja: "マーケティング職の有力候補2人の面接を木曜日に設定。女性は月・火にシカゴの見本市で不在。採用者はロバートのチームに入るので彼も同席する。",
    qs: [{ q: "What are the speakers discussing?", c: ["Filling a job opening", "Planning a trade show", "Launching a product", "Changing an office layout"], a: 0, ex: "マーケティング職の履歴書と面接の話 → 求人を埋めること。" },
      { q: "What does the woman say about Monday and Tuesday?", c: ["She will be at a trade show.", "She will interview candidates.", "She has a medical appointment.", "She will be training staff."], a: 0, ex: "I'm out of the office ... for the trade show in Chicago." },
      { q: "Why will Robert join the interviews?", c: ["He is the department head.", "The new employee will work on his team.", "He has social media experience.", "He wrote the job posting."], a: 1, ex: "the new hire will be on his team（新しく雇う人が彼のチームに入る）。" }] },
  { lv: 4, kind: "talk", lines: [["M", "Welcome to the Greenfield Chocolate factory tour. My name is Paul, and I'll be your guide today."], ["M", "The tour takes about forty-five minutes."], ["M", "First, we'll see how cocoa beans are roasted. After that, you'll visit our tasting room, where you can try three of our newest flavors."], ["M", "Please note that photography is not allowed inside the production area."], ["M", "At the end of the tour, everyone will receive a coupon for our gift shop."]],
    ja: "チョコレート工場の見学ツアー。所要約45分。焙煎を見たあと試食室で新作3種。製造エリアは撮影禁止。最後にギフトショップのクーポンがもらえる。",
    qs: [{ q: "How long is the tour?", c: ["About fifteen minutes", "About thirty minutes", "About forty-five minutes", "About one hour"], a: 2, ex: "The tour takes about forty-five minutes." },
      { q: "What are listeners asked not to do?", c: ["Eat in the factory", "Take pictures in the production area", "Touch the machines", "Leave the group"], a: 1, ex: "photography is not allowed → take pictures の言い換え。" },
      { q: "What will listeners receive at the end of the tour?", c: ["A box of chocolates", "A free drink", "A discount coupon", "A souvenir photo"], a: 2, ex: "a coupon for our gift shop（ギフトショップのクーポン）。" }] },
  { lv: 5, kind: "conv", lines: [["W", "Hiroshi, the board approved the budget for the new inventory software."], ["M", "That's good news. When are we supposed to have it up and running?"], ["W", "By the start of the next quarter. But the vendor says installation will take two weeks, and the warehouse staff will need training."], ["M", "Hmm, our busiest season starts in October."], ["W", "Right. That's why I'd like to schedule the training for early September."], ["M", "I'll talk to the warehouse supervisor about rearranging shifts."]],
    ja: "取締役会が在庫管理ソフトの予算を承認。次の四半期の初めまでに稼働させたいが、導入に2週間かかり研修も必要。10月は繁忙期なので研修は9月初めに。男性は倉庫の責任者とシフト調整を話す。",
    qs: [{ q: "What did the board approve?", c: ["A new warehouse", "Funding for software", "Extra staff", "A delivery schedule"], a: 1, ex: "the budget for the new inventory software → funding for software の言い換え。" },
      { q: "Why does the man say, \"our busiest season starts in October\"?", c: ["To suggest canceling the project", "To express concern about the timing", "To ask for a raise", "To complain about the vendor"], a: 1, ex: "導入・研修の時期が繁忙期と重なる心配。女性が That's why（だから9月に）と受けているのがヒント。" },
      { q: "What will the man most likely do next?", c: ["Contact the vendor", "Speak with a supervisor", "Install the software", "Prepare a budget"], a: 1, ex: "I'll talk to the warehouse supervisor（倉庫の責任者と話す）。" }] },
  { lv: 5, kind: "talk", lines: [["W", "In business news, Northgate Motors announced today that it will open a new assembly plant in Riverton next spring."], ["W", "The plant is expected to create around eight hundred jobs."], ["W", "Company officials said the location was chosen because of its proximity to the port, which will reduce shipping costs."], ["W", "Local leaders welcomed the decision, although some residents have raised concerns about increased traffic."], ["W", "Northgate will hold a public meeting at City Hall on March 3 to answer questions."]],
    ja: "ノースゲート自動車が来春リバートンに組立工場を開設、約800人の雇用。港に近く輸送費を削減できるため。交通量の増加を心配する住民もいる。3月3日に市役所で説明会。",
    qs: [{ q: "What is the news report mainly about?", c: ["A company's new factory", "A change in shipping laws", "A city election", "A car recall"], a: 0, ex: "assembly plant（組立工場）→ factory の言い換え。" },
      { q: "Why was Riverton chosen?", c: ["It has many skilled workers.", "It is close to a port.", "Land is inexpensive there.", "The city offered tax breaks."], a: 1, ex: "proximity to the port（港に近いこと）。" },
      { q: "What will happen on March 3?", c: ["Construction will begin.", "A public meeting will be held.", "Hiring will start.", "The plant will open."], a: 1, ex: "hold a public meeting at City Hall on March 3" }] },
  { lv: 6, kind: "conv", lines: [["M", "Ms. Alvarez, I've finished going over the contract from Brightline Logistics."], ["W", "Anything we should be concerned about?"], ["M", "Mostly it's what we discussed, but there's a clause that lets them raise their rates by up to eight percent if fuel prices go up."], ["W", "That wasn't in the draft we saw. And with our margins as thin as they are..."], ["M", "Exactly. I'd suggest we ask them to cap any increase at three percent, or at least require sixty days' notice."], ["W", "Let's propose both. Could you draft a reply before tomorrow's call with their account manager?"]],
    ja: "物流会社の契約書に、燃料費が上がれば最大8%値上げできる条項があった。利益が薄いので、上限3%か60日前の通知を求めることに。両方を提案し、男性が返信の下書きを作る。",
    qs: [{ q: "What has the man been doing?", c: ["Reviewing a contract", "Negotiating fuel prices", "Preparing a budget", "Interviewing an account manager"], a: 0, ex: "going over the contract → reviewing a contract の言い換え。" },
      { q: "What does the woman imply when she says, \"with our margins as thin as they are\"?", c: ["The company cannot easily absorb higher costs.", "The company should hire more staff.", "The contract is too long.", "Fuel prices will go down."], a: 0, ex: "利益が薄いので値上げを吸収できない、という含み。" },
      { q: "What does the woman ask the man to do?", c: ["Call the account manager", "Write a response", "Cancel the contract", "Calculate fuel costs"], a: 1, ex: "draft a reply → write a response の言い換え。" }] },
];

// Part 7：本文（\n で改行）と設問
const P7 = [
  { lv: 1, title: "Notice（お知らせ）", text: "City Library\nNew Opening Hours\n\nStarting May 1, the City Library will be open from 9 A.M. to 8 P.M., Monday to Saturday. The library will be closed on Sundays.\n\nChildren's story time is every Saturday at 10 A.M. For more information, please ask at the front desk.",
    qs: [{ q: "When will the new hours start?", c: ["April 1", "May 1", "Saturday", "Sunday"], a: 1, ex: "Starting May 1 とある。" },
      { q: "When is the library closed?", c: ["On Mondays", "On Saturdays", "On Sundays", "Every evening"], a: 2, ex: "The library will be closed on Sundays." },
      { q: "What happens on Saturday mornings?", c: ["A book sale", "Story time for children", "A computer class", "A staff meeting"], a: 1, ex: "Children's story time is every Saturday at 10 A.M." }] },
  { lv: 2, title: "E-mail（メール）", text: "To: All staff\nFrom: Mia Chen, Office Manager\nSubject: Kitchen cleaning\n\nHello everyone,\n\nThe office kitchen will be cleaned this Friday afternoon. Please take your food out of the refrigerator by 1 P.M. on Friday. Anything left inside will be thrown away. The kitchen will be open again on Monday morning.\n\nThank you,\nMia",
    qs: [{ q: "Why did Ms. Chen send the e-mail?", c: ["To announce a cleaning", "To invite staff to lunch", "To order a new refrigerator", "To change office hours"], a: 0, ex: "件名と1文目から、台所の掃除のお知らせ。" },
      { q: "What are staff asked to do?", c: ["Clean the kitchen", "Remove their food", "Bring lunch on Friday", "Buy a new refrigerator"], a: 1, ex: "take your food out → remove their food の言い換え。" },
      { q: "When can staff use the kitchen again?", c: ["Friday at 1 P.M.", "Friday evening", "Saturday", "Monday morning"], a: 3, ex: "open again on Monday morning" }] },
  { lv: 3, title: "Advertisement（広告）", text: "Sunrise Fitness Center: Grand Opening!\n\nJoin us at our new location at 250 Oak Street, just across from Central Station. To celebrate our opening, we are offering a special membership rate of $30 per month for anyone who signs up before June 15. That is $15 less than our regular price.\n\nMembers enjoy:\n- Access to the gym from 6 A.M. to 11 P.M.\n- Free yoga classes on weekends\n- Free parking for up to two hours\n\nVisit www.sunrisefitness.com to sign up online.",
    qs: [{ q: "What is being advertised?", c: ["A new gym", "A train service", "A parking garage", "A yoga teacher"], a: 0, ex: "フィットネスセンターの開店広告。" },
      { q: "What is the regular monthly price?", c: ["$15", "$30", "$45", "$60"], a: 2, ex: "$30 は通常より$15安い → 通常は$45。計算が必要な設問。" },
      { q: "What is NOT mentioned as a benefit for members?", c: ["Free yoga classes", "Free parking", "Free personal training", "Access until 11 P.M."], a: 2, ex: "パーソナルトレーニングは書かれていない。NOT 問題は選択肢を本文と1つずつ照らし合わせる。" }] },
  { lv: 3, title: "Text messages（チャット）", text: "Kenji Mori [9:12 A.M.]\nHi, Laura. I'm stuck in traffic on Route 9. I don't think I'll make it to the 9:30 meeting with Mr. Hart.\n\nLaura Benson [9:14 A.M.]\nNo problem. I can start the meeting and go over the sales figures first.\n\nKenji Mori [9:15 A.M.]\nThanks. The slides are in the shared folder.\n\nLaura Benson [9:16 A.M.]\nGot it. I'll ask him to wait for you before we discuss the contract.",
    qs: [{ q: "Why does Mr. Mori send the first message?", c: ["He will be late.", "He lost his slides.", "He wants to cancel the meeting.", "He forgot the address."], a: 0, ex: "渋滞で9時半の会議に間に合わない。" },
      { q: "At 9:16 A.M., what does Ms. Benson most likely mean when she writes, \"Got it\"?", c: ["She knows where the slides are.", "She received a package.", "She found Mr. Hart.", "She finished the contract."], a: 0, ex: "スライドが共有フォルダにある、という直前のメッセージを了解した。" },
      { q: "What will be discussed after Mr. Mori arrives?", c: ["The sales figures", "The contract", "The traffic", "The shared folder"], a: 1, ex: "wait for you before we discuss the contract → 契約の話は森さんの到着後。" }] },
  { lv: 4, title: "Article（記事）", text: "HARBOR CITY: Bayside Books, a family-owned bookstore that has served Harbor City for over forty years, will move to a larger location on Market Street next month. Owner Diane Cole said the store had simply outgrown its current space. \"Our customers have been asking for more seating and a bigger children's section,\" she explained.\n\nThe new store will include a small cafe and an event space for author readings and book club meetings. The current shop on Elm Avenue will close on August 20, and the new location is scheduled to open on September 1. To thank its loyal customers, Bayside Books will offer a 20 percent discount on all purchases during the opening week.",
    qs: [{ q: "Why is Bayside Books moving?", c: ["Its rent increased.", "It needs more space.", "It was sold to a new owner.", "Its building will be renovated."], a: 1, ex: "outgrown its current space（今の店が手狭になった）。" },
      { q: "What will the new store have that the current one does not?", c: ["A children's section", "A cafe", "Used books", "Longer hours"], a: 1, ex: "The new store will include a small cafe. 児童書コーナーは「より大きく」なるだけ。" },
      { q: "When will customers be able to get a discount?", c: ["Before August 20", "On August 20", "During the first week of September", "All of September"], a: 2, ex: "新店は9月1日開店で、オープン週が割引 → 9月の第1週。" }] },
  { lv: 4, title: "Invoice（請求書）", text: "Lumen Office Supply\nInvoice #4471 / Date: October 3\nBill to: Ridgeway Accounting, 18 Pine Road\n\nPrinter paper (box) x 5 ........ $120.00\nBlack ink cartridges x 4 ...... $96.00\nDesk lamps x 2 ................ $70.00\nSubtotal ...................... $286.00\nDelivery ...................... $0.00\nTotal ......................... $286.00\n\nPayment is due within 30 days. Orders over $250 qualify for free delivery. Questions about this invoice? Call our billing office at 555-0140.",
    qs: [{ q: "Why was there no delivery charge?", c: ["The customer picked up the items.", "The order was over $250.", "It was a first order.", "A coupon was used."], a: 1, ex: "Orders over $250 qualify for free delivery. 合計は$286。" },
      { q: "By when should Ridgeway Accounting pay?", c: ["By October 3", "Within 30 days", "Within 7 days", "At the time of delivery"], a: 1, ex: "Payment is due within 30 days." },
      { q: "Which item was ordered in the largest quantity?", c: ["Printer paper", "Ink cartridges", "Desk lamps", "Envelopes"], a: 0, ex: "数量は紙が5、インクが4、ランプが2。" }] },
  { lv: 5, title: "Letter（手紙）", text: "Dear Mr. Okafor,\n\nThank you for your interest in the Senior Analyst position at Veltrix Consulting. After reviewing your application, our hiring committee would like to invite you to a second interview on Tuesday, April 12, at 10:00 A.M. at our downtown office.\n\nThis interview will consist of a 30-minute case study exercise followed by a conversation with two of our partners. Please bring a copy of your portfolio and a valid photo ID, which is required to enter the building.\n\nIf the proposed time is inconvenient, kindly contact me by April 5 so that we can arrange an alternative. We look forward to meeting you again.\n\nSincerely,\nGrace Lindqvist\nHuman Resources Manager",
    qs: [{ q: "What is the purpose of the letter?", c: ["To offer Mr. Okafor a job", "To schedule a follow-up interview", "To request references", "To reject an application"], a: 1, ex: "second interview（二次面接）への招待 → follow-up interview の言い換え。" },
      { q: "What is suggested about Mr. Okafor?", c: ["He has already met with the company.", "He works for Veltrix Consulting.", "He is a partner at the firm.", "He lives downtown."], a: 0, ex: "second interview や meeting you again から、すでに一度面接を受けているとわかる。" },
      { q: "Why must Mr. Okafor bring a photo ID?", c: ["To complete a case study", "To get into the building", "To receive payment", "To register for parking"], a: 1, ex: "which is required to enter the building（入館に必要）。" }] },
  { lv: 6, title: "Schedule and e-mail（予定表とメール）", text: "[Schedule] Westbrook Regional Trade Expo, Day 2\n9:00 A.M.   Keynote: The Future of Retail (Hall A)\n10:30 A.M.  Panel: Sustainable Packaging (Room 204)\n1:00 P.M.   Workshop: Pricing Strategies (Room 110)\n3:00 P.M.   Networking Reception (Atrium)\n\n[E-mail]\nTo: Daniel Ruiz\nFrom: Priya Nair\nSubject: Day 2 plans\n\nDaniel,\nI've been asked to fill in for one of the panelists whose flight was canceled, so I'll be in Room 204 preparing for most of the morning. Could you attend the keynote in my place and take notes? I'll meet you at the workshop afterward, since I'm particularly keen on that topic. Also, the organizers mentioned that the reception has been moved to the rooftop terrace due to the expected crowd size.\nPriya",
    qs: [{ q: "Why will Ms. Nair miss the keynote?", c: ["Her flight was canceled.", "She will be taking part in a panel.", "She has to meet a client.", "She is organizing the expo."], a: 1, ex: "fill in for one of the panelists（パネリストの代役）→ 午前は Room 204 で準備。欠航したのは別のパネリスト。" },
      { q: "At what time will Ms. Nair meet Mr. Ruiz?", c: ["9:00 A.M.", "10:30 A.M.", "1:00 P.M.", "3:00 P.M."], a: 2, ex: "I'll meet you at the workshop → 予定表で Workshop は午後1時。2つの文書を組み合わせる設問。" },
      { q: "What has changed about the event?", c: ["The keynote speaker", "The location of the reception", "The time of the workshop", "The topic of the panel"], a: 1, ex: "reception has been moved to the rooftop terrace → 懇親会の場所が Atrium から変更。" }] },
];
