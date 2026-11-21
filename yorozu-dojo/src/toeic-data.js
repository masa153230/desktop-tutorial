/* よろず道場 — TOEIC 教材（オリジナル問題。公式問題の転載ではない）
 * 単語: 「語|品詞|意味|例文（*対象語*）|例文の訳」 帯は目標スコアの目安
 * Part 5: 「レベル|分類|問題文（-------）|正解;誤1;誤2;誤3|解説」
 * Part 2: 「レベル|問いかけ|正解|誤1|誤2|解説」
 */
const TOEIC_DATA = (() => {
  const W = {
    600: `
available|形|利用できる・手が空いている|Is Ms. Chen *available* on Friday afternoon?|チェンさんは金曜の午後、空いていますか？
schedule|名|予定（表）|Please check the *schedule* before the meeting.|会議の前に予定表を確認してください。
deliver|動|配達する・届ける|The package will be *delivered* tomorrow morning.|荷物は明日の朝に届きます。
employee|名|従業員|All *employees* must attend the safety training.|全従業員が安全研修に出席しなければならない。
customer|名|顧客|We received a call from an angry *customer*.|怒った顧客から電話があった。
purchase|動|購入する|You can *purchase* tickets online.|チケットはオンラインで購入できます。
receipt|名|領収書・レシート|Please keep your *receipt* for returns.|返品のためにレシートを保管してください。
invoice|名|請求書|We will send the *invoice* by e-mail.|請求書はメールでお送りします。
deadline|名|締め切り|The *deadline* for the report is Monday.|報告書の締め切りは月曜日です。
department|名|部署|She works in the sales *department*.|彼女は営業部で働いている。
product|名|製品|Our new *product* will be released in May.|新製品は5月に発売される。
order|動|注文する|I *ordered* twenty boxes of paper.|紙を20箱注文した。
repair|動|修理する|The printer needs to be *repaired*.|プリンターは修理が必要だ。
reserve|動|予約する|I'd like to *reserve* a table for four.|4人で席を予約したいのですが。
cancel|動|取り消す・中止する|The flight was *canceled* because of the storm.|嵐のため便が欠航になった。
confirm|動|確認する|Could you *confirm* your phone number?|電話番号を確認していただけますか？
attend|動|出席する|Over two hundred people *attended* the conference.|200人以上がその会議に出席した。
hire|動|雇う|The company plans to *hire* ten new workers.|会社は新しく10人を雇う予定だ。
apply|動|応募する・申し込む|He *applied* for the manager position.|彼は管理職のポジションに応募した。
require|動|必要とする|This job *requires* a driver's license.|この仕事には運転免許が必要だ。
provide|動|提供する|We *provide* free parking for guests.|お客様には無料の駐車場を提供しています。
offer|動|提供する・申し出る|The store *offers* a ten percent discount.|その店は10%の割引をしている。
include|動|含む|The price *includes* breakfast.|料金には朝食が含まれている。
increase|動|増える・増やす|Sales *increased* by five percent last year.|昨年、売上は5%増えた。
reduce|動|減らす|We need to *reduce* costs.|コストを減らす必要がある。
improve|動|改善する|The new system will *improve* efficiency.|新しいシステムは効率を改善するだろう。
expand|動|拡大する|The company is *expanding* into Asia.|会社はアジアに事業を拡大している。
launch|動|始める・発売する|They will *launch* the campaign next week.|彼らは来週キャンペーンを始める。
inform|動|知らせる|Please *inform* us of any changes.|変更があればお知らせください。
contact|動|連絡する|Feel free to *contact* me at any time.|いつでもお気軽にご連絡ください。
arrange|動|手配する|I'll *arrange* a meeting with the client.|顧客との打ち合わせを手配します。
prepare|動|準備する|She is *preparing* a presentation.|彼女はプレゼンの準備をしている。
discuss|動|話し合う|Let's *discuss* the budget tomorrow.|明日予算について話し合おう。
decide|動|決める|We *decided* to move the office.|私たちは事務所を移転することに決めた。
replace|動|取り替える|We need to *replace* the old computers.|古いパソコンを取り替える必要がある。
return|動|返す・戻る|Please *return* the form by Friday.|金曜日までに用紙を返送してください。
promote|動|昇進させる・販売促進する|Mr. Park was *promoted* to director.|パクさんは部長に昇進した。
manage|動|管理する|She *manages* a team of twelve.|彼女は12人のチームを管理している。
receive|動|受け取る|Did you *receive* my e-mail?|私のメールを受け取りましたか？
complete|動|完了する・記入を済ませる|The project was *completed* on time.|プロジェクトは期限どおりに完了した。
explain|動|説明する|Could you *explain* the new rules?|新しい規則を説明していただけますか？
suggest|動|提案する|I *suggest* that we take a break.|休憩を取ることを提案します。
recommend|動|勧める|I highly *recommend* this restaurant.|このレストランは強くおすすめです。
review|動|見直す・検討する|Please *review* the contract carefully.|契約書を注意深く見直してください。
share|動|共有する|Thank you for *sharing* the information.|情報を共有してくれてありがとう。
update|動|更新する|We *updated* our website last week.|先週ウェブサイトを更新した。
announce|動|発表する|The company *announced* a new president.|会社は新しい社長を発表した。
introduce|動|導入する・紹介する|We *introduced* a new payment system.|新しい支払いシステムを導入した。
locate|動|位置する（be located）|The hotel is *located* near the station.|ホテルは駅の近くにある。
register|動|登録する|You must *register* for the workshop in advance.|ワークショップには事前登録が必要です。
sign|動|署名する|Please *sign* at the bottom of the page.|ページの一番下に署名してください。
ship|動|発送する|Your order was *shipped* today.|ご注文の品は本日発送されました。
charge|動|請求する|They *charged* me twenty dollars for delivery.|配送料として20ドル請求された。
exchange|動|交換する|Can I *exchange* this shirt for a smaller size?|このシャツを小さいサイズに交換できますか？
delay|動|遅らせる|The train was *delayed* by heavy snow.|大雪で電車が遅れた。
client|名|顧客・取引先|I have lunch with a *client* today.|今日は取引先と昼食だ。
colleague|名|同僚|My *colleague* will help you.|同僚がお手伝いします。
supervisor|名|上司・監督者|Ask your *supervisor* for permission.|上司に許可をもらってください。
staff|名|職員・スタッフ|Our *staff* will greet you at the entrance.|入口でスタッフがお迎えします。
position|名|職・地位|The *position* requires three years of experience.|その職には3年の経験が必要だ。
experience|名|経験|Do you have any sales *experience*?|営業の経験はありますか？
interview|名|面接|I have a job *interview* tomorrow.|明日、就職の面接がある。
resume|名|履歴書|Please send your *resume* by e-mail.|履歴書をメールで送ってください。
salary|名|給料|The *salary* depends on experience.|給料は経験によって決まる。
budget|名|予算|We are over *budget* this month.|今月は予算オーバーだ。
cost|名|費用|The *cost* of materials has risen.|材料費が上がった。
fee|名|料金・手数料|There is no *fee* for cancellation.|キャンセル料はかかりません。
discount|名|割引|Members get a fifteen percent *discount*.|会員は15%の割引が受けられる。
item|名|品物・項目|This *item* is out of stock.|この商品は在庫切れだ。
stock|名|在庫|We have plenty of paper in *stock*.|紙の在庫はたっぷりある。
warehouse|名|倉庫|The boxes are stored in the *warehouse*.|箱は倉庫に保管されている。
factory|名|工場|The *factory* produces car parts.|その工場は自動車部品を生産している。
equipment|名|機器・設備|The *equipment* is checked every month.|機器は毎月点検される。
supply|名|供給・備品|Office *supplies* are in the closet.|事務用品は物入れにあります。
document|名|書類|Please sign these *documents* today.|今日この書類に署名してください。
form|名|用紙・書式|You can download the application *form* from our website.|申込用紙はウェブサイトからダウンロードできます。
report|名|報告書|I finished the sales *report*.|売上報告書を仕上げた。
survey|名|調査・アンケート|Please take a few minutes to complete the *survey*.|数分ほどアンケートにご協力ください。
result|名|結果|The *results* will be announced next week.|結果は来週発表される。
detail|名|詳細|For more *details*, visit our website.|詳しくはウェブサイトをご覧ください。
advertisement|名|広告|I saw your *advertisement* in the newspaper.|新聞で御社の広告を見ました。
event|名|行事・イベント|The *event* starts at seven.|イベントは7時に始まる。
conference|名|会議・協議会|The *conference* will be held in Boston.|会議はボストンで開かれる。
presentation|名|発表・プレゼン|Her *presentation* was very clear.|彼女のプレゼンはとても分かりやすかった。
agenda|名|議題・予定表|The first item on the *agenda* is the budget.|議題の最初は予算だ。
appointment|名|（面会の）約束・予約|I have a dentist *appointment* at three.|3時に歯医者の予約がある。
reservation|名|予約|I'd like to make a *reservation* for tonight.|今夜の予約をしたいのですが。
flight|名|（飛行機の）便|My *flight* was delayed by two hours.|私の便は2時間遅れた。
passenger|名|乗客|*Passengers* should arrive one hour early.|乗客は1時間前に到着してください。
direction|名|道順・指示|Could you give me *directions* to the museum?|美術館への道順を教えていただけますか？
traffic|名|交通（量）|I was stuck in *traffic* this morning.|今朝は渋滞につかまった。
parking|名|駐車|*Parking* is free on weekends.|週末は駐車料金が無料です。
facility|名|施設|The sports *facility* is open until ten.|そのスポーツ施設は10時まで開いている。
entrance|名|入口|Please use the main *entrance*.|正面玄関をご利用ください。
lobby|名|ロビー|Let's meet in the hotel *lobby*.|ホテルのロビーで会いましょう。
copy|名|部・写し|Please make ten *copies* of this page.|このページを10部コピーしてください。
package|名|小包|A *package* arrived for you.|あなた宛てに小包が届きました。
quality|名|品質|We never sacrifice *quality*.|私たちは品質を決して犠牲にしない。
service|名|サービス・業務|The hotel is known for its excellent *service*.|そのホテルは素晴らしいサービスで知られている。
industry|名|業界・産業|She has worked in the travel *industry* for years.|彼女は長年旅行業界で働いてきた。
market|名|市場|The *market* for electric cars is growing.|電気自動車の市場は成長している。
profit|名|利益|The company made a large *profit*.|会社は大きな利益を上げた。
sales|名|売上|*Sales* rose sharply in December.|12月に売上が急増した。
competitor|名|競合他社|Our main *competitor* lowered its prices.|最大の競合他社が値下げした。
headquarters|名|本社|Our *headquarters* is in Osaka.|本社は大阪にある。
branch|名|支店|We opened a new *branch* in Nagoya.|名古屋に新しい支店を開いた。
public|形|公共の・一般の|*Public* transportation is convenient in this city.|この街は公共交通機関が便利だ。
free|形|無料の・空いている|The museum offers *free* guided tours.|その美術館は無料のガイドツアーを行っている。
convenient|形|便利な・都合がよい|Is Tuesday *convenient* for you?|火曜日はご都合いかがですか？
necessary|形|必要な|Please bring all *necessary* documents.|必要な書類をすべてお持ちください。
current|形|現在の|What is your *current* address?|現住所はどちらですか？
previous|形|以前の・前の|In my *previous* job, I was a sales clerk.|前の仕事では販売員だった。
recent|形|最近の|According to a *recent* survey, most users are satisfied.|最近の調査によると、ほとんどの利用者が満足している。
annual|形|年に1度の|The *annual* meeting is held in June.|年次総会は6月に開かれる。
local|形|地元の|We buy vegetables from *local* farmers.|地元の農家から野菜を買っている。
various|形|さまざまな|The store sells *various* kinds of tea.|その店はさまざまな種類のお茶を売っている。
several|形|いくつかの|I called him *several* times.|彼に何度か電話した。
entire|形|全体の|The *entire* staff joined the party.|スタッフ全員がパーティーに参加した。
additional|形|追加の|There is an *additional* charge for delivery.|配送には追加料金がかかります。
extra|形|余分の・追加の|Do you have an *extra* pen?|余分なペンはありますか？
efficient|形|効率的な|The new machine is more *efficient*.|新しい機械の方が効率的だ。
reasonable|形|手頃な・妥当な|The prices are very *reasonable*.|値段はとても手頃だ。
excellent|形|優れた|You did an *excellent* job.|素晴らしい仕事でした。
successful|形|成功した|The event was very *successful*.|イベントは大成功だった。
responsible|形|責任がある・担当の|Who is *responsible* for this project?|このプロジェクトの担当は誰ですか？
due|形|期限で・予定で|The rent is *due* on the first of each month.|家賃は毎月1日が期限だ。
latest|形|最新の|Have you seen the *latest* version?|最新版を見ましたか？
upcoming|形|今度の・近づいている|Please read the notice about the *upcoming* holiday.|今度の休日についてのお知らせを読んでください。
probably|副|たぶん|He will *probably* be late.|彼はたぶん遅れるだろう。
recently|副|最近|I *recently* moved to Kobe.|最近神戸に引っ越した。
immediately|副|すぐに|Please call me *immediately*.|すぐに電話してください。
currently|副|現在|She is *currently* on vacation.|彼女は現在休暇中だ。
finally|副|ついに・最後に|The package *finally* arrived.|ついに荷物が届いた。
directly|副|直接|You can contact him *directly*.|彼に直接連絡できます。
especially|副|特に|The museum is crowded, *especially* on weekends.|美術館は特に週末に混む。
approximately|副|およそ|The trip takes *approximately* three hours.|移動はおよそ3時間かかる。
unfortunately|副|残念ながら|*Unfortunately*, the item is sold out.|残念ながらその商品は売り切れです。
however|副|しかしながら|The plan is good. *However*, it is expensive.|その計画は良い。しかし費用がかかる。
instead|副|代わりに|Let's take a taxi *instead*.|代わりにタクシーに乗ろう。
until|前|〜まで（ずっと）|The store is open *until* nine.|店は9時まで開いている。
by|前|〜までに（期限）|Please finish it *by* Friday.|金曜日までに終わらせてください。
during|前|〜の間に|Please turn off your phone *during* the meeting.|会議中は携帯電話の電源を切ってください。
within|前|〜以内に|We will reply *within* two days.|2日以内にお返事します。
due to|前|〜のために（原因）|The game was canceled *due to* rain.|試合は雨のため中止になった。
although|接|〜だけれども|*Although* it was raining, we went out.|雨が降っていたが、私たちは出かけた。
unless|接|〜しない限り|We can't start *unless* everyone is here.|全員がそろわない限り始められない。
while|接|〜の間・〜の一方で|I read a book *while* I waited.|待っている間に本を読んだ。
look for|句|探す|I'm *looking for* the post office.|郵便局を探しています。
fill out|句|記入する|Please *fill out* this form.|この用紙に記入してください。
set up|句|設置する・準備する|Can you help me *set up* the projector?|プロジェクターの設置を手伝ってくれますか？
pick up|句|受け取る・迎えに行く|You can *pick up* your order at the counter.|ご注文の品はカウンターでお受け取りいただけます。
drop off|句|置いていく・届ける|Please *drop off* the keys at the front desk.|鍵はフロントに預けてください。
turn off|句|消す|Don't forget to *turn off* the lights.|電気を消すのを忘れないで。
take place|句|行われる|The ceremony will *take place* in the main hall.|式典は大ホールで行われる。
in charge of|句|〜を担当して|Ms. Ito is *in charge of* the event.|伊藤さんがそのイベントの担当だ。
as soon as possible|句|できるだけ早く|Please reply *as soon as possible*.|できるだけ早く返信してください。
on time|句|時間どおりに|The train arrived *on time*.|電車は時間どおりに着いた。
in advance|句|前もって|Please book *in advance*.|前もって予約してください。
out of order|句|故障中で|The elevator is *out of order*.|エレベーターは故障中だ。
`,
    730: `
reimburse|動|払い戻す・経費を精算する|The company will *reimburse* your travel expenses.|会社が交通費を精算してくれる。
expense|名|費用・経費|Please submit your *expenses* by the end of the month.|経費は月末までに申請してください。
submit|動|提出する|All proposals must be *submitted* by noon.|提案書はすべて正午までに提出すること。
approve|動|承認する|The manager *approved* the budget.|部長が予算を承認した。
revise|動|修正する|Please *revise* the draft and send it back.|下書きを修正して送り返してください。
draft|名|下書き・草案|I'll send you the first *draft* today.|今日、最初の草案を送ります。
inquiry|名|問い合わせ|Thank you for your *inquiry* about our services.|当社のサービスについてお問い合わせいただきありがとうございます。
estimate|名|見積もり|Could you give us an *estimate* for the repairs?|修理の見積もりをいただけますか？
quote|名|見積もり（価格）|We received a *quote* from three suppliers.|3社の供給業者から見積もりを受け取った。
supplier|名|供給業者・仕入れ先|We changed our paper *supplier*.|紙の仕入れ先を変えた。
merger|名|合併|The *merger* will create the largest bank in the country.|その合併で国内最大の銀行が誕生する。
acquire|動|買収する・獲得する|The firm *acquired* a small software company.|その会社は小さなソフトウェア会社を買収した。
expertise|名|専門知識|We need someone with technical *expertise*.|技術的な専門知識を持つ人が必要だ。
renovation|名|改装|The lobby is closed for *renovation*.|ロビーは改装のため閉鎖中だ。
inventory|名|在庫（目録）|We check the *inventory* every Friday.|毎週金曜に在庫を確認する。
commute|動|通勤する|She *commutes* to work by bus.|彼女はバスで通勤している。
tenant|名|入居者・テナント|All *tenants* must follow the building rules.|入居者は全員、建物の規則に従わなければならない。
venue|名|会場|The *venue* can hold five hundred people.|会場は500人収容できる。
itinerary|名|旅程表|I'll e-mail you the *itinerary* for the trip.|旅程表をメールで送ります。
complimentary|形|無料の（サービスの）|Guests receive a *complimentary* breakfast.|宿泊客には無料の朝食がつく。
mandatory|形|義務的な・必須の|Attendance at the meeting is *mandatory*.|会議への出席は必須だ。
eligible|形|資格がある・対象となる|Full-time employees are *eligible* for the bonus.|正社員はボーナスの対象になる。
qualified|形|資格のある・適任の|We are looking for *qualified* candidates.|適任の候補者を探しています。
candidate|名|候補者|We interviewed five *candidates*.|5人の候補者と面接した。
applicant|名|応募者|*Applicants* must have a university degree.|応募者は大学の学位が必要だ。
reference|名|推薦状・照会先|Please list two *references* on the form.|用紙に照会先を2件書いてください。
contract|名|契約（書）|We signed a two-year *contract*.|2年契約を結んだ。
negotiate|動|交渉する|We *negotiated* a lower price.|価格を下げてもらうよう交渉した。
proposal|名|提案（書）|The board accepted our *proposal*.|取締役会は私たちの提案を受け入れた。
board|名|取締役会|The *board* will meet on Thursday.|取締役会は木曜日に開かれる。
shareholder|名|株主|The report was sent to all *shareholders*.|報告書は全株主に送られた。
revenue|名|収益・歳入|Annual *revenue* reached ten million dollars.|年間収益は1000万ドルに達した。
quarter|名|四半期|Profits rose in the third *quarter*.|第3四半期に利益が増えた。
forecast|名|予測|The weather *forecast* says it will rain.|天気予報では雨だ。
decline|動|減少する・断る|Sales *declined* by ten percent.|売上は10%減少した。
retail|形|小売りの|She manages a *retail* store downtown.|彼女は中心街の小売店を経営している。
merchandise|名|商品|All *merchandise* is on sale this week.|今週は全商品がセール中だ。
warranty|名|保証（書）|The laptop comes with a one-year *warranty*.|そのノートパソコンには1年保証がついている。
defective|形|欠陥のある|We will replace any *defective* products.|欠陥品はすべて交換いたします。
refund|名|返金|You can get a full *refund* within thirty days.|30日以内なら全額返金を受けられます。
subscription|名|定期購読・定額契約|My magazine *subscription* ends next month.|雑誌の定期購読は来月で終わる。
expire|動|期限が切れる|Your membership *expires* on March 31.|会員資格は3月31日に切れます。
renew|動|更新する|I *renewed* my passport last week.|先週パスポートを更新した。
membership|名|会員資格|*Membership* includes free parking.|会員には無料駐車場が含まれる。
admission|名|入場（料）|*Admission* is free on Mondays.|月曜日は入場無料。
exhibition|名|展示会|The *exhibition* runs until the end of May.|展示会は5月末まで開かれている。
brochure|名|パンフレット|Please take a *brochure* on your way out.|お帰りの際にパンフレットをお取りください。
catalog|名|カタログ|Our new *catalog* is now available online.|新しいカタログがオンラインで見られます。
feedback|名|意見・感想|We welcome your *feedback*.|ご意見をお待ちしています。
complaint|名|苦情|We received several *complaints* about the noise.|騒音について何件か苦情を受けた。
satisfied|形|満足した|Most customers were *satisfied* with the service.|ほとんどの客がサービスに満足した。
assist|動|手伝う・支援する|Our staff will *assist* you with your luggage.|スタッフがお荷物をお運びします。
assistance|名|援助|If you need *assistance*, please call this number.|お手伝いが必要ならこの番号に電話してください。
handle|動|処理する・扱う|She *handles* all customer complaints.|彼女が客の苦情をすべて処理している。
deal with|句|対処する|We need to *deal with* this problem quickly.|この問題に早く対処する必要がある。
postpone|動|延期する|The meeting was *postponed* until Friday.|会議は金曜日に延期された。
reschedule|動|予定を変更する|Can we *reschedule* our appointment?|予約の日時を変更できますか？
extend|動|延長する|We *extended* the deadline by one week.|締め切りを1週間延長した。
temporary|形|一時的な|The road closure is *temporary*.|道路の閉鎖は一時的なものだ。
permanent|形|永久的な・常勤の|She got a *permanent* position.|彼女は正規の職に就いた。
lease|名|賃貸契約|We signed a five-year *lease* on the office.|事務所について5年の賃貸契約を結んだ。
property|名|不動産・物件|The *property* is close to the beach.|その物件は海岸の近くにある。
real estate|名|不動産|He works for a *real estate* agency.|彼は不動産会社に勤めている。
utility|名|（電気・ガス・水道の）公共料金|The rent does not include *utilities*.|家賃に光熱費は含まれない。
maintenance|名|保守点検|The system will be down for *maintenance* tonight.|今夜はメンテナンスのためシステムが止まる。
install|動|設置する|A new air conditioner was *installed* yesterday.|昨日新しいエアコンが設置された。
technician|名|技術者|A *technician* will visit your home on Monday.|月曜日に技術者がご自宅に伺います。
procedure|名|手順|Please follow the safety *procedures*.|安全手順に従ってください。
policy|名|方針・規定|Our return *policy* allows thirty days.|当店の返品規定は30日以内です。
regulation|名|規則|New *regulations* begin in April.|新しい規則は4月に始まる。
permit|名|許可証|You need a *permit* to park here.|ここに駐車するには許可証が必要だ。
fare|名|運賃|The bus *fare* went up to 250 yen.|バスの運賃が250円に上がった。
destination|名|目的地|We reached our *destination* at noon.|正午に目的地に着いた。
depart|動|出発する|The train *departs* at 8:15.|電車は8時15分に出発する。
accommodation|名|宿泊施設|The price includes flights and *accommodation*.|料金には航空券と宿泊が含まれる。
cater|動|料理を提供する|Who is *catering* the party?|パーティーの料理はどこが提供するの？
refreshments|名|軽食|*Refreshments* will be served after the talk.|講演の後に軽食が出ます。
participant|名|参加者|Each *participant* will receive a certificate.|参加者全員に修了証が渡される。
volunteer|名|ボランティア|We need *volunteers* for the festival.|お祭りのボランティアを募集している。
donation|名|寄付|Thank you for your generous *donation*.|多大なご寄付をありがとうございます。
fund|名|資金|The project ran out of *funds*.|プロジェクトは資金が尽きた。
invest|動|投資する|The company *invested* heavily in research.|会社は研究に多額の投資をした。
research|名|研究・調査|The *research* took three years.|その研究には3年かかった。
analyze|動|分析する|We *analyzed* the survey results.|アンケート結果を分析した。
figure|名|数字|The sales *figures* look good.|売上の数字は好調だ。
significant|形|大幅な・重要な|There was a *significant* increase in sales.|売上が大幅に増えた。
gradually|副|徐々に|Prices are *gradually* rising.|物価が徐々に上がっている。
regularly|副|定期的に|The machines are inspected *regularly*.|機械は定期的に点検されている。
frequently|副|頻繁に|He *frequently* travels to China.|彼は頻繁に中国へ出張する。
promptly|副|すぐに・時間どおりに|The meeting will start *promptly* at nine.|会議は9時ちょうどに始まる。
originally|副|もともと|The building was *originally* a school.|その建物はもともと学校だった。
temporarily|副|一時的に|The store is *temporarily* closed.|店は一時休業中だ。
otherwise|副|さもないと・それ以外は|Please hurry. *Otherwise*, we'll miss the train.|急いで。さもないと電車に乗り遅れる。
therefore|副|したがって|The road is closed. *Therefore*, we will go another way.|道路が閉鎖されている。したがって別の道を行く。
prior to|前|〜より前に|Please arrive ten minutes *prior to* the start.|開始の10分前にお越しください。
regarding|前|〜に関して|I'm calling *regarding* your order.|ご注文の件でお電話しています。
according to|前|〜によると|*According to* the report, sales are up.|報告によると売上は増えている。
despite|前|〜にもかかわらず|*Despite* the rain, the event was a success.|雨にもかかわらず、イベントは成功した。
as long as|接|〜する限り|You can stay *as long as* you like.|好きなだけいていいですよ。
once|接|いったん〜すると|*Once* you finish, please let me know.|終わったら知らせてください。
in order to|句|〜するために|We moved *in order to* save money.|お金を節約するために引っ越した。
be supposed to|句|〜することになっている|The bus *is supposed to* arrive at six.|バスは6時に着くことになっている。
run out of|句|〜を切らす|We've *run out of* paper.|紙を切らしてしまった。
look into|句|調べる|I'll *look into* the problem.|その問題を調べてみます。
put off|句|延期する|They *put off* the trip until next year.|彼らは旅行を来年に延期した。
call off|句|中止する|The game was *called off* because of rain.|試合は雨で中止になった。
get back to|句|折り返し連絡する|I'll *get back to* you tomorrow.|明日折り返しご連絡します。
sign up for|句|申し込む|I *signed up for* a cooking class.|料理教室に申し込んだ。
hand in|句|提出する|Please *hand in* your report by Friday.|金曜までにレポートを提出してください。
on behalf of|句|〜を代表して|*On behalf of* the company, I thank you.|会社を代表してお礼申し上げます。
take over|句|引き継ぐ|Ms. Kato will *take over* the project.|加藤さんがプロジェクトを引き継ぐ。
ahead of schedule|句|予定より早く|The work was finished *ahead of schedule*.|作業は予定より早く終わった。
redeem|動|（ポイント・券を）引き換える|You can *redeem* your points for gifts.|ポイントを景品と引き換えられます。
`,
    860: `
implement|動|実施する|The new policy will be *implemented* next month.|新方針は来月実施される。
allocate|動|割り当てる|We *allocated* more money to advertising.|広告にさらに資金を割り当てた。
comply|動|従う（with）|All products *comply* with safety standards.|全製品が安全基準を満たしている。
adjacent|形|隣接した|The hotel is *adjacent* to the convention center.|ホテルはコンベンションセンターに隣接している。
tentative|形|仮の|This is a *tentative* schedule.|これは仮の予定です。
fiscal|形|会計の|The *fiscal* year begins in April.|会計年度は4月に始まる。
preliminary|形|予備的な|*Preliminary* results look promising.|予備的な結果は有望だ。
lucrative|形|もうかる|It was a *lucrative* contract.|それはもうかる契約だった。
consecutive|形|連続した|Sales rose for the third *consecutive* year.|売上は3年連続で増えた。
endorse|動|支持する・推奨する|The product is *endorsed* by doctors.|その製品は医師に推奨されている。
incur|動|（費用を）負う|You may *incur* a late fee.|延滞料が発生する場合があります。
exceed|動|超える|Demand *exceeded* our expectations.|需要は予想を超えた。
anticipate|動|予期する・見込む|We *anticipate* strong demand this summer.|今夏は強い需要を見込んでいる。
accommodate|動|収容する・対応する|The room can *accommodate* fifty people.|その部屋は50人収容できる。
facilitate|動|促進する・円滑にする|The software *facilitates* communication.|そのソフトは意思疎通を円滑にする。
streamline|動|合理化する|We *streamlined* the ordering process.|発注手続きを合理化した。
outsource|動|外部委託する|The company *outsources* its customer support.|その会社は顧客サポートを外部委託している。
consolidate|動|統合する|The two offices will be *consolidated*.|2つの事務所は統合される。
relocate|動|移転する|The headquarters will *relocate* to Tokyo.|本社は東京に移転する。
oversee|動|監督する|She *oversees* the marketing team.|彼女はマーケティングチームを監督している。
prioritize|動|優先する|We need to *prioritize* customer safety.|顧客の安全を優先する必要がある。
verify|動|確認する・検証する|Please *verify* your e-mail address.|メールアドレスを確認してください。
assess|動|評価する|We will *assess* the damage tomorrow.|明日被害を評価する。
evaluate|動|評価する|Employees are *evaluated* twice a year.|従業員は年に2回評価される。
retain|動|保持する・引き留める|It is hard to *retain* skilled workers.|熟練労働者を引き留めるのは難しい。
enhance|動|高める|The new design *enhances* safety.|新しいデザインは安全性を高める。
undergo|動|受ける・経験する|The bridge is *undergoing* repairs.|その橋は修理中だ。
conclude|動|終える・結論を出す|The meeting *concluded* at five.|会議は5時に終わった。
reinforce|動|強化する|The wall was *reinforced* with steel.|壁は鋼鉄で補強された。
designate|動|指定する|Smoking is allowed only in *designated* areas.|喫煙は指定区域でのみ可能です。
commence|動|始まる|Construction will *commence* in June.|工事は6月に始まる。
dispose of|句|処分する|Please *dispose of* old batteries properly.|古い電池は適切に処分してください。
adhere to|句|守る|All staff must *adhere to* the dress code.|全スタッフは服装規定を守らなければならない。
in compliance with|句|〜に従って|The work was done *in compliance with* local laws.|作業は地元の法律に従って行われた。
in accordance with|句|〜に従って|Payments are made *in accordance with* the contract.|支払いは契約に従って行われる。
in the event of|句|〜の場合には|*In the event of* a fire, use the stairs.|火災の際は階段を使ってください。
substantial|形|かなりの|The company made a *substantial* investment.|会社はかなりの投資をした。
considerable|形|相当な|It took a *considerable* amount of time.|かなりの時間がかかった。
comprehensive|形|包括的な|We offer a *comprehensive* training program.|包括的な研修プログラムを提供している。
prospective|形|見込みのある・将来の|We met with several *prospective* clients.|何人かの見込み客と会った。
preferred|形|望ましい|Experience in sales is *preferred*.|営業経験があれば尚可。
proficient|形|熟達した|Applicants must be *proficient* in English.|応募者は英語に堪能でなければならない。
reliable|形|信頼できる|We need a *reliable* supplier.|信頼できる供給業者が必要だ。
durable|形|耐久性のある|These bags are light and *durable*.|これらのバッグは軽くて丈夫だ。
affordable|形|手頃な価格の|We offer *affordable* housing for students.|学生向けに手頃な住宅を提供している。
outstanding|形|未払いの・傑出した|Please pay the *outstanding* balance.|未払いの残高をお支払いください。
pending|形|保留中の・未決の|The decision is *pending* approval.|決定は承認待ちだ。
confidential|形|機密の|This information is strictly *confidential*.|この情報は極秘です。
mutual|形|相互の|The agreement is based on *mutual* trust.|その合意は相互の信頼に基づいている。
interim|形|暫定の|He was named *interim* director.|彼は暫定の部長に任命された。
subsequent|形|その後の|*Subsequent* meetings will be held online.|その後の会議はオンラインで行われる。
respectively|副|それぞれ|Tom and Ann are 30 and 25, *respectively*.|トムとアンはそれぞれ30歳と25歳だ。
accordingly|副|それに応じて|Prices will be adjusted *accordingly*.|価格はそれに応じて調整される。
consistently|副|一貫して|She has *consistently* exceeded her targets.|彼女は一貫して目標を上回ってきた。
tentatively|副|仮に|The meeting is *tentatively* scheduled for May 3.|会議は5月3日に仮決定している。
substantially|副|大幅に|Costs have increased *substantially*.|コストは大幅に増加した。
shortly|副|まもなく|The train will arrive *shortly*.|電車はまもなく到着します。
thoroughly|副|徹底的に|Please read the instructions *thoroughly*.|説明書をよく読んでください。
exclusively|副|もっぱら・限定で|This offer is *exclusively* for members.|この特典は会員限定です。
whereas|接|〜である一方|Ken likes tea, *whereas* his wife prefers coffee.|ケンは紅茶が好きだが、妻はコーヒーの方が好きだ。
provided that|接|〜という条件で|You can borrow it, *provided that* you return it by Friday.|金曜日までに返すなら借りてもいいよ。
malfunction|名|故障|The delay was caused by an equipment *malfunction*.|遅延は機器の故障が原因だった。
shortage|名|不足|There is a *shortage* of nurses.|看護師が不足している。
surplus|名|余剰|The city has a budget *surplus*.|市は予算の黒字がある。
deficit|名|赤字・不足|The company reported a *deficit* this year.|会社は今年赤字を報告した。
incentive|名|奨励金・動機|Employees receive *incentives* for good performance.|従業員は好成績に対して報奨金を受け取る。
initiative|名|新たな取り組み|The *initiative* aims to reduce waste.|その取り組みは廃棄物の削減を目指している。
objective|名|目標|Our main *objective* is to increase sales.|私たちの主な目標は売上を増やすことだ。
criteria|名|基準（複数）|The *criteria* for selection are listed below.|選考の基準は以下の通りです。
specification|名|仕様|The product meets all *specifications*.|製品はすべての仕様を満たしている。
prototype|名|試作品|Engineers tested the *prototype*.|技術者たちが試作品をテストした。
patent|名|特許|The company holds a *patent* on the design.|その会社はそのデザインの特許を持っている。
logistics|名|物流|He works in *logistics*.|彼は物流の仕事をしている。
personnel|名|人員・人事部|Only authorized *personnel* may enter.|許可された職員のみ立ち入り可。
attire|名|服装|Business *attire* is required.|ビジネス服の着用が必要です。
reimbursement|名|払い戻し|Submit receipts for *reimbursement*.|払い戻しのために領収書を提出してください。
turnover|名|離職率・売上高|The company has a low staff *turnover*.|その会社は離職率が低い。
amenities|名|設備・アメニティ|The hotel *amenities* include a pool and a gym.|ホテルの設備にはプールとジムがある。
vendor|名|販売業者|We are comparing prices from several *vendors*.|数社の業者の価格を比較している。
dimension|名|寸法|Please check the *dimensions* of the box.|箱の寸法を確認してください。
detour|名|回り道|Drivers must take a *detour*.|運転者は迂回しなければならない。
`,
    990: `
expedite|動|早める・迅速に処理する|Can you *expedite* the shipment?|発送を急いでいただけますか？
discrepancy|名|食い違い|There is a *discrepancy* between the two reports.|2つの報告書の間に食い違いがある。
contingency|名|不測の事態|We need a *contingency* plan.|緊急時の計画が必要だ。
amenable|形|（提案を）受け入れる|The client is *amenable* to the new terms.|顧客は新しい条件を受け入れる意向だ。
delinquent|形|滞納している|The account is three months *delinquent*.|その口座は3か月滞納している。
stipulate|動|規定する|The contract *stipulates* that payment is due in 30 days.|契約では支払いは30日以内と規定されている。
reconcile|動|（帳簿を）照合する・一致させる|The accountant *reconciled* the accounts.|会計士が帳簿を照合した。
rescind|動|撤回する|The company *rescinded* the job offer.|会社は内定を取り消した。
waive|動|（料金・権利を）免除する|The bank agreed to *waive* the fee.|銀行は手数料を免除することに同意した。
mitigate|動|軽減する|We took steps to *mitigate* the risk.|リスクを軽減する対策を取った。
procure|動|調達する|We need to *procure* new equipment.|新しい機器を調達する必要がある。
procurement|名|調達|She works in *procurement*.|彼女は調達部門で働いている。
liability|名|法的責任・負債|The company denied *liability* for the accident.|会社は事故の責任を否定した。
collateral|名|担保|The house was used as *collateral*.|家が担保にされた。
arbitration|名|仲裁|The dispute was settled through *arbitration*.|紛争は仲裁で解決された。
remuneration|名|報酬|*Remuneration* will be discussed at the interview.|報酬は面接で話し合います。
indispensable|形|不可欠な|She is an *indispensable* member of the team.|彼女はチームに欠かせない存在だ。
meticulous|形|細心の|He is *meticulous* about details.|彼は細部にまで細心の注意を払う。
imperative|形|必須の|It is *imperative* that we act now.|今すぐ行動することが不可欠だ。
inadvertently|副|うっかり|I *inadvertently* deleted the file.|うっかりファイルを消してしまった。
provisional|形|暫定的な|We issued a *provisional* license.|仮免許を発行した。
lenient|形|寛大な|The new rules are more *lenient*.|新しい規則はより寛大だ。
stringent|形|厳しい|The factory has *stringent* safety rules.|その工場には厳しい安全規則がある。
feasible|形|実現可能な|Is the plan financially *feasible*?|その計画は資金面で実現可能か？
viable|形|実行可能な・存続可能な|We need a *viable* alternative.|実行可能な代替案が必要だ。
unprecedented|形|前例のない|The company saw *unprecedented* growth.|会社は前例のない成長を遂げた。
pertinent|形|関連のある|Please include all *pertinent* information.|関連する情報はすべて含めてください。
adverse|形|不利な・有害な|The drug has few *adverse* effects.|その薬には副作用がほとんどない。
inclement|形|（天候が）荒れた|The event may be canceled due to *inclement* weather.|悪天候の場合、イベントは中止になることがある。
alleviate|動|和らげる|The new road will *alleviate* traffic.|新しい道路が渋滞を緩和する。
augment|動|増やす・増強する|We hired temporary staff to *augment* our team.|チームを増強するため臨時スタッフを雇った。
curtail|動|削減する|The company *curtailed* travel spending.|会社は出張費を削減した。
deem|動|〜とみなす|The plan was *deemed* too risky.|その計画は危険すぎるとみなされた。
solicit|動|求める・募る|We are *soliciting* feedback from users.|利用者からの意見を募っている。
disseminate|動|広める・周知する|The information was *disseminated* to all staff.|その情報は全職員に周知された。
ramification|名|（予期しない）影響|We must consider the legal *ramifications*.|法的な影響を考慮しなければならない。
contingent on|句|〜次第で|The offer is *contingent on* a background check.|採用は身元調査次第だ。
commensurate with|句|〜に見合った|Salary will be *commensurate with* experience.|給与は経験に見合った額になります。
in lieu of|句|〜の代わりに|You may take time off *in lieu of* overtime pay.|残業代の代わりに休暇を取ることができる。
pursuant to|句|〜に従って|*Pursuant to* the agreement, the fee is waived.|合意に従い、料金は免除される。
notwithstanding|前|〜にもかかわらず|*Notwithstanding* the delay, the project succeeded.|遅れにもかかわらず、プロジェクトは成功した。
`,
  };

  const P5 = `
1|pos|Please read the instructions -------.|carefully;careful;care;cared|動詞 read を修飾するのは副詞。-ly の carefully。
1|pos|The ------- of the new store is scheduled for May 1.|opening;open;opened;opens|冠詞 The と前置詞 of の間は名詞。opening（開店）。
1|pos|Ms. Garcia is a very ------- manager.|experienced;experience;experiencing;experiences|a very ___ manager。名詞を修飾するのは形容詞。experienced＝経験豊富な。
1|pos|Our staff will respond to your request -------.|quickly;quick;quickness;quicken|動詞 respond を修飾するのは副詞。
1|pos|The company made an important ------- yesterday.|decision;decide;decisive;decided|形容詞 important のあとは名詞。decision。
1|pos|This software is ------- to use.|easy;ease;easily;eased|be動詞のあとで主語を説明するのは形容詞。be easy to use＝使いやすい。
1|pos|We are looking for a new ------- for our Osaka branch.|manager;management;managed;manage|a new のあとは名詞。人を表す manager。management（経営）は a がつかない。
1|verb|Mr. Tanaka ------- to Singapore last week.|traveled;travels;will travel;has traveled|last week（過去の時点）があるので過去形。現在完了は過去の時点と一緒に使えない。
1|verb|The new office ------- next month.|will open;opened;has opened;was opening|next month は未来。will open。
1|verb|Every employee ------- an ID card.|needs;need;needing;are needing|Every＋単数名詞は単数扱い → 三単現の s。
1|verb|The meeting room ------- every evening.|is cleaned;cleans;is cleaning;cleaned|部屋は「掃除される」側 → 受動態。every evening は習慣なので現在形。
1|verb|Ms. Lee ------- for this company since 2019.|has worked;works;worked;is working|since 2019（〜以来ずっと）は現在完了の継続。
1|prep|The store is open ------- 9 A.M. to 6 P.M.|from;at;in;on|from A to B＝AからBまで。
1|prep|The report must be submitted ------- Friday.|by;until;at;in|「〜までに（期限）」は by。until は「〜までずっと（継続）」。
1|prep|Please wait here ------- the manager arrives.|until;by;during;since|後ろに文（主語＋動詞）→接続詞。「来るまでずっと待つ」なので until。by・during は前置詞で文を続けられない。
1|prep|The flight was delayed ------- bad weather.|because of;because;although;so|後ろが名詞（bad weather）→前置詞の because of。because は接続詞で後ろに文が来る。
1|prep|------- it was raining, the game continued.|Although;Despite;Because;However|後ろに文、意味は「〜にもかかわらず」→接続詞 Although。Despite は前置詞、However は副詞で文をつなげない。
1|pron|Mr. Kim forgot ------- umbrella at the office.|his;him;he;himself|名詞 umbrella の前は所有格 his。
1|pron|Please send the files to ------- by noon.|me;my;I;mine|前置詞 to のあとは目的格 me。
1|pron|The designers created the logo -------.|themselves;them;their;they|「自分たちで」は再帰代名詞 themselves。主語 The designers に合わせる。
1|vocab|Please ------- this form and return it to the front desk.|complete;occur;arrive;happen|form を目的語に取れる他動詞は complete（記入を済ませる）。occur・arrive・happen は目的語を取らない。
1|vocab|The hotel is ------- located near the airport.|conveniently;recently;finally;nearly|conveniently located（便利な場所にある）は定番の組み合わせ。
1|comp|This printer is ------- than the old one.|faster;fast;fastest;more fast|than があるので比較級。fast → faster。
1|comp|This is the ------- hotel in the city.|largest;larger;large;most large|the＋最上級。large → largest。
1|rel|The woman ------- called you is my boss.|who;which;whose;whom|先行詞が人（The woman）で、後ろに動詞 called が続く → 主格の who。
1|rel|This is the book ------- I told you about.|that;who;what;where|先行詞が物で、about の目的語が欠けている → that（which も可）。what は前に名詞を置けない。
2|pos|The new policy will ------- affect small businesses.|significantly;significant;significance;signify|助動詞 will と動詞 affect の間は副詞。
2|pos|We appreciate your ------- in this matter.|cooperation;cooperate;cooperative;cooperatively|所有格 your のあとは名詞。
2|pos|Applicants should have strong ------- skills.|communication;communicate;communicative;communicated|名詞＋名詞の複合名詞 communication skills（伝える力）。
2|pos|The results were ------- better than expected.|considerably;considerable;consider;consideration|比較級 better を修飾するのは副詞。considerably better＝かなり良い。
2|pos|Ms. Patel gave a very ------- presentation.|informative;inform;information;informatively|very＋形容詞＋名詞。informative＝有益な。
2|pos|The factory has become more ------- since the upgrade.|productive;product;production;productively|become のあとは形容詞（補語）。more productive。
2|pos|All ------- must wear a visitor's badge.|visitors;visits;visiting;visited|All のあとに主語になる名詞。badge をつけるのは人 → visitors。
2|pos|Ticket prices vary ------- on the seat location.|depending;depend;dependent;dependence|depending on〜＝〜によって（決まり文句）。
2|verb|The contract ------- by both parties next week.|will be signed;will sign;signed;has signed|契約書は「署名される」側 → 受動態。next week なので will be signed。
2|verb|By the time we arrived, the meeting -------.|had already started;already starts;has already started;will already start|過去の一点（到着した時）より前に終わっていた → 過去完了 had started。
2|verb|If the weather ------- good tomorrow, the picnic will be held in the park.|is;will be;was;would be|時・条件を表す if 節の中は、未来のことでも現在形。
2|verb|The manager asked that all reports ------- by Friday.|be submitted;are submitted;were submitted;submitting|ask・request・suggest that の節は動詞の原形。報告書は提出される側なので be submitted。
2|verb|Mr. Ross is used to ------- long hours.|working;work;worked;works|be used to＋動名詞＝〜に慣れている。この to は前置詞。
2|verb|The marketing team is considering ------- the launch date.|changing;to change;change;changed|consider は動名詞を目的語に取る（consider doing）。
2|verb|We look forward to ------- you at the event.|seeing;see;seen;have seen|look forward to＋動名詞。この to も前置詞。
2|verb|The proposal ------- now by the board.|is being reviewed;is reviewing;reviews;has reviewed|now＋「検討されている」→ 進行形の受動態 is being reviewed。
2|verb|Neither the manager nor the employees ------- aware of the change.|were;was;is;has been|neither A nor B は B（the employees＝複数）に動詞を合わせる。
2|prep|------- the heavy rain, the event was held as planned.|Despite;Although;Even though;Because|後ろが名詞句 → 前置詞 Despite。Although・Even though・Because は接続詞。
2|prep|The office will be closed ------- the renovation.|during;while;for;since|後ろが名詞 the renovation → 前置詞 during。while は接続詞。
2|prep|Please contact us ------- you have any questions.|if;unless;whether;despite|「質問があれば連絡を」→ if。unless は「〜しない限り」。
2|prep|You cannot enter the lab ------- you have a permit.|unless;if;because;so that|「許可証を持っていない限り入れない」→ unless。
2|prep|The package should arrive ------- three business days.|within;among;between;along|「〜以内に」within＋期間。
2|prep|The seminar is free ------- charge for members.|of;in;for;at|free of charge＝無料で。
2|prep|------- the new system is installed, we will train all staff.|Once;Even;Despite;During|後ろが文 → 接続詞。「いったん〜したら」の Once。
2|prep|Both full-time ------- part-time workers can apply.|and;or;nor;but|Both A and B。either A or B、neither A nor B とセットで覚える。
2|pron|Employees must submit ------- timesheets every Friday.|their;them;they;themselves|名詞の前は所有格。Employees（複数）→ their。
2|pron|The two companies agreed to share ------- research data.|their;its;them;theirs|主語が The two companies（複数）なので their。its は単数のとき。
2|rel|Anyone ------- wants to attend should register online.|who;whom;whose;which|Anyone は人。後ろに動詞 wants が続く → 主格の who。
2|rel|The hotel ------- we stayed was near the beach.|where;which;what;who|後ろが欠けのない文（we stayed）で先行詞が場所 → 関係副詞 where。which なら stayed at が必要。
2|rel|Ms. Wong, ------- office is on the third floor, is the new director.|whose;who;whom;which|後ろに名詞 office が続き「彼女の事務所」→ 所有格の whose。
2|rel|------- you need is a good night's sleep.|What;That;Which;It|「あなたに必要なもの」→ 先行詞を含む What。
2|vocab|Sales are expected to ------- 10 million dollars this year.|exceed;expand;extend;expect|exceed＝（数量を）超える。expand は規模を広げる、extend は期間を延ばす。
2|vocab|Please ------- the attached file for details.|refer to;look;explain;mention|refer to＝参照する。look なら look at が必要。
2|vocab|The CEO will ------- the opening ceremony.|attend;participate;arrive;belong|attend は他動詞で直接目的語を取る。participate in・arrive at・belong to と前置詞が必要。
2|vocab|Our prices are very ------- compared to other stores.|competitive;competing;competent;completed|competitive prices＝競争力のある（安い）価格。competent は「有能な」で人に使う。
2|vocab|Customers can ------- their points for gifts.|redeem;remind;remove;retire|redeem A for B＝AをBと引き換える。ポイント・クーポンの定番。
2|vocab|The train was delayed, so we missed our ------- flight.|connecting;connected;connection;connect|connecting flight＝乗り継ぎ便。
2|vocab|Due to a scheduling -------, the meeting has been moved to Thursday.|conflict;contrast;contact;contract|scheduling conflict＝予定の重なり。
2|vocab|Please ------- from using your phone in the theater.|refrain;avoid;prevent;stop|refrain from doing＝〜を控える。avoid は avoid using（from 不要）。
2|comp|Sales this year are ------- higher than last year.|much;very;more;most|比較級を強めるのは much・far・even。very は比較級を修飾しない。
2|comp|This model is twice as expensive ------- the old one.|as;than;so;like|倍数は twice as〜as。
2|comp|Of the three proposals, Mr. Ito's was the ------- persuasive.|most;more;much;very|3つの中で一番 → 最上級 the most。
2|comp|The more you practice, the ------- you will become.|better;good;best;well|The＋比較級, the＋比較級＝〜すればするほど…。
2|comp|Hardly ------- attended the meeting.|anyone;someone;everyone;no one|hardly は否定語。否定文なので anyone。hardly anyone＝ほとんど誰も〜ない。
3|pos|The new procedure has been ------- effective in reducing errors.|remarkably;remarkable;remark;remarked|形容詞 effective を修飾するのは副詞。
3|pos|Profits rose ------- in the second quarter.|sharply;sharp;sharpen;sharpness|自動詞 rose を修飾するのは副詞。
3|pos|The board approved the plan for the ------- of the two divisions.|consolidation;consolidate;consolidated;consolidating|the と of の間は名詞。consolidation＝統合。
3|pos|The workshop is designed for ------- who are new to management.|those;these;them;they|those who〜＝〜する人々（決まった形）。
3|pos|Ms. Diaz is ------- for reviewing all expense reports.|responsible;responsibility;responsibly;response|be responsible for〜＝〜の責任がある。be動詞のあとは形容詞。
3|pos|Customer satisfaction is our top -------.|priority;prioritize;prior;prioritized|形容詞 top のあとは名詞。
3|pos|Please handle these fragile items with -------.|caution;cautious;cautiously;cautioned|前置詞 with のあとは名詞。with caution＝注意して。
3|pos|The proposal was rejected because it was not financially -------.|feasible;feasibility;feasibly;feasibleness|be＋副詞＋形容詞。financially feasible＝資金的に実現可能。
3|verb|Had we known about the delay, we ------- a later flight.|would have booked;would book;had booked;will book|Had we known＝If we had known（倒置）。過去の事実に反する仮定 → would have＋過去分詞。
3|verb|Should you have any questions, please ------- us.|contact;contacted;contacting;to contact|Should you have〜＝If you should have〜（倒置）。主節は命令文なので原形。
3|verb|The new software, ------- last month, has already improved efficiency.|installed;installing;was installed;installs|名詞を後ろから説明する過去分詞（設置された）。was installed だと動詞が2つになる。
3|verb|------- the deadline, the team worked through the weekend.|To meet;Meet;Met;Being met|「締め切りに間に合わせるために」→ 目的を表す不定詞 To meet。
3|verb|The number of applicants ------- increased this year.|has;have;are;were|The number of〜（〜の数）は単数扱い。a number of〜（多くの〜）は複数扱い。
3|verb|It is essential that every participant ------- the safety rules.|follow;follows;followed;will follow|essential・important that の節は動詞の原形。
3|verb|The shipment is expected ------- by Thursday.|to arrive;arriving;arrive;arrived|be expected to do＝〜する見込みだ。
3|verb|Ms. Brown had her assistant ------- the documents.|prepare;prepared;to prepare;preparing|have＋人＋動詞の原形＝人に〜してもらう。
3|verb|Having ------- the report, Mr. Lee sent it to his manager.|completed;complete;completing;to complete|Having＋過去分詞（完了の分詞構文）＝〜し終えてから。
3|prep|The event will proceed as planned ------- the weather.|regardless of;in spite;even if;whereas|後ろが名詞 → 前置詞句 regardless of（〜に関係なく）。in spite は of が必要。even if・whereas は接続詞。
3|prep|------- the merger, the company will be renamed.|Following;Followed;To follow;Follow|following＝〜の後に（前置詞として使う）。Following the merger＝合併後に。
3|prep|Mr. Sato will lead the meeting ------- Ms. Kim's absence.|in;on;at;by|in someone's absence＝〜がいない間に。
3|prep|Please take an umbrella ------- it rains this afternoon.|in case;so that;in order to;as if|in case＋文＝〜する場合に備えて。in order to のあとは動詞の原形。
3|prep|The office will remain open ------- the holiday period.|throughout;thorough;though;through out|throughout＋期間＝〜の間ずっと。thorough は「徹底的な」（形容詞）。
3|prep|------- employees nor managers were informed of the change.|Neither;Either;Both;Not|nor とセットなのは neither。
3|prep|The project was successful, ------- it went over budget.|although;despite;because of;therefore|後ろが文で逆接 → 接続詞 although。therefore は副詞で文をつなげない。
3|rel|Of all the candidates, Ms. Ota is the one ------- qualifications best match the job.|whose;who;which;whom|後ろに名詞 qualifications が続き「その人の資格」→ whose。
3|pron|The managers met with ------- to discuss the merger.|one another;each;themself;other|「お互い」は one another（each other）。themself は使えない。
3|pron|Some participants liked the plan, while ------- did not.|others;another;the other;other|不特定の「他の人たち」→ others。the other は残りの1人（1つ）。
3|rel|The city ------- the conference will be held is famous for its seafood.|in which;which;what;where in|後ろが欠けのない文 → 前置詞＋which（＝where）。
3|rel|Please give the form to ------- is at the reception desk.|whoever;whomever;whichever;whatever|「受付にいる人なら誰でも」。後ろに動詞 is が続くので主格の whoever。
3|vocab|The CEO ------- the success of the project to the team's hard work.|attributed;contributed;distributed;assigned|attribute A to B＝AをBのおかげとする。contribute は contribute to B（Bに貢献する）。
3|vocab|The new regulations will take ------- on April 1.|effect;affect;effort;effective|take effect＝（法律・規則が）発効する。affect は動詞。
3|vocab|The factory is operating at full ------- to meet demand.|capacity;capability;ability;quantity|operate at full capacity＝フル稼働する。
3|vocab|Ms. Ford was ------- with organizing the annual conference.|tasked;asked;demanded;required|be tasked with〜＝〜を任される。asked なら asked to organize の形。
3|vocab|The product failed to ------- customer expectations.|meet;arrive;attend;gain|meet expectations＝期待に応える。
3|vocab|All information you provide will be kept strictly -------.|confidential;confident;confidence;confided|keep〜confidential＝〜を秘密にする。confident は「自信がある」。
3|vocab|Dr. Hill is a ------- authority on renewable energy.|leading;leaded;lead;leads|leading authority＝第一人者。
3|vocab|Prices are subject to ------- without notice.|change;changed;changeable;changeably|be subject to change＝変更されることがある（決まり文句）。to は前置詞なので名詞の change。
3|comp|Ms. Hara's sales figures are higher than ------- of any other employee.|those;that;these;them|比べているのは sales figures（複数）→ those of〜。
3|comp|No other city in the region is ------- Kyoto in terms of history.|as old as;older;the oldest;oldest than|No other A is as〜as B＝BほどのAはない（最上級の意味）。older なら than が必要。
3|comp|The second quarter was not ------- profitable as the first.|as;so much;more;than|not as〜as＝〜ほど…ない。
3|comp|Only after the inspection ------- the building be opened.|can;it can;is;has|Only＋副詞句が文頭に来ると倒置（助動詞が主語の前）。can the building be opened。
`;

  const P2 = `
1|Where is the meeting room?|It's on the second floor.|At three o'clock.|Yes, I met him.|Where（どこ）には場所で答える。時刻や Yes/No は不可。
1|When does the store open?|At ten in the morning.|Near the station.|It's very open.|When には時で答える。open をくり返す選択肢はひっかけ。
1|Who is giving the presentation?|Ms. Rivera is.|In the main hall.|It was a nice present.|Who には人で答える。present は presentation と音が似たひっかけ。
1|How much is this jacket?|It's eighty dollars.|It's very much.|Yes, I like jackets.|How much（いくら）には値段。
1|Would you like some coffee?|Yes, please.|It's in the kitchen.|I liked it.|勧められたら Yes, please. / No, thank you.
1|Can you help me with this box?|Sure, where should I put it?|It's a big box.|I helped him yesterday.|依頼には引き受ける返事。質問で返すのもよくある正解パターン。
1|Did you send the e-mail?|Yes, this morning.|At the post office.|It's my e-mail address.|Did you〜? には Yes/No ＋情報。
1|What time is your flight?|It leaves at six.|To London.|About two hours.|What time には時刻。To London は行き先、two hours は所要時間。
1|Why was the meeting canceled?|The manager is sick.|At two o'clock.|In room B.|Why には理由。Because がなくても理由なら正解。
1|Is this seat taken?|No, go ahead.|Take a seat.|It's a big seat.|空いているか聞かれて「どうぞ」。take・seat のくり返しはひっかけ。
1|How do you get to work?|I usually take the bus.|At eight thirty.|I work in sales.|How do you get to〜? は交通手段。
1|Which color do you prefer?|The blue one.|Yes, I prefer it.|It's a color printer.|Which には選んで答える。
1|Whose bag is this?|I think it's Mr. Lopez's.|It's a black bag.|At the airport.|Whose（誰の）には持ち主。
1|How long will the meeting last?|About an hour.|Last week.|In room five.|How long は長さ。last（続く）と last（この前の）のひっかけ。
1|Where did you buy that phone?|At the shop downtown.|Last Saturday.|It was cheap.|Where は場所。
2|Why don't we have lunch outside today?|That sounds good.|Because it's raining.|I had lunch at noon.|Why don't we〜? は理由ではなく「〜しませんか」という提案。
2|You've finished the report, haven't you?|Almost, I need one more hour.|Yes, I'll report it.|The report was long.|付加疑問文は普通の疑問文と同じ。「もうすぐ」という答えも自然。
2|Should I call the client or send an e-mail?|An e-mail would be better.|Yes, you should.|She's a new client.|A or B の選択疑問に Yes/No では答えない。
2|Who's in charge of the new project?|It hasn't been decided yet.|The charge is ten dollars.|It's a new project.|「まだ決まっていない」は Who 疑問文のよくある正解。charge のひっかけに注意。
2|When will the new manager start?|I haven't heard anything.|At the main office.|She's very kind.|「知らない・聞いていない」系はどの疑問詞にも使える正解パターン。
2|Where can I find the printer paper?|Ask Lisa at the front desk.|Yes, the printer works.|Ten sheets, please.|場所を聞かれて「〇〇に聞いて」と答えるのも定番の正解。
2|Isn't the store open on Sundays?|Not anymore.|It's a big store.|On Monday morning.|否定疑問文も普通の疑問文と同じように答える。Not anymore＝今はもう開いていない。
2|How about meeting at the station?|Sure, what time?|By train.|It's near here.|How about〜? は提案。賛成して時間を聞き返すのが自然。
2|Could you show me how to use this machine?|I'm busy right now, but Tom can.|It's a new machine.|I showed it yesterday.|依頼を断り、代わりの人を示すのもよくある正解。
2|I can't find my keys.|Did you check your desk?|They're the key points.|Yes, I can.|平叙文には、相手を助ける反応や質問で返すのが自然。key の別の意味はひっかけ。
2|What did you think of the new design?|It looks much better.|I designed it.|Last Tuesday.|What did you think of〜? は感想を聞いている。
2|Has the shipment arrived yet?|It's expected this afternoon.|Yes, it's a ship.|By plane.|「午後に届く予定」と答えて、まだ届いていないことを伝えている。
2|Do you want the window seat or the aisle seat?|I don't mind.|Yes, I want one.|The window is open.|選択疑問には「どちらでもいい」も正解になる。
2|Why is the road closed?|They're repairing it.|Close to the station.|Turn left at the corner.|closed（閉鎖された）と close（近い）のひっかけ。
2|Let's review the budget tomorrow.|I'm out of the office tomorrow.|It's a great view.|Yes, I'll buy it.|提案に「明日はいない」と答えて間接的に断っている。review と view の音のひっかけ。
2|Where are the sales figures?|I sent them to you this morning.|Yes, the sales went well.|He's a figure skater.|場所ではなく「今朝送った」と答える間接的な応答。
2|How often do you visit the factory?|About twice a month.|For two hours.|It's a big factory.|How often は頻度。
2|Would you mind closing the door?|Not at all.|It's close to here.|No, I didn't close it.|Would you mind〜? に Not at all（いいですよ）。mind は「嫌がる」なので否定で答えると承諾。
2|Who should I give this form to?|Leave it on my desk.|A form for new staff.|Yes, I'll give it.|Who に人名でなく「机に置いて」と答える間接的な応答。
3|Why hasn't the contract been signed yet?|The lawyer is still reviewing it.|Sign here, please.|It was a two-year contract.|理由を「まだ弁護士が確認中」と答える。
3|Aren't you supposed to be on vacation this week?|My trip was postponed.|Yes, it's a nice vacation spot.|I suppose so.|「休暇のはずでは？」→「旅行が延期になった」。suppose のひっかけ。
3|The printer on the third floor is out of toner again.|I'll order some more.|It's on the second floor.|Print two copies, please.|問題の報告に、対応を申し出て返す。
3|Do you know when the conference starts?|The schedule should be on the website.|I know him well.|In the conference room.|「サイトに予定があるはず」と情報のありかを示す。
3|Should we hire more staff or pay overtime?|Let's look at the budget first.|Yes, we should.|He was hired last year.|選択疑問に「まず予算を見よう」と判断を保留する答え。
3|I thought the store opened at nine.|They changed the hours last week.|At nine is fine.|Yes, I bought it.|意外さを表す平叙文。「先週営業時間が変わった」が自然な返し。
3|Who's going to pick up the clients at the airport?|Mr. Han volunteered.|At terminal two.|They picked a good one.|Who に人（Mr. Han）。pick のひっかけ。
3|How was the training session?|Better than I expected.|Every Tuesday.|By train.|感想を聞く How was〜?。training と train のひっかけ。
3|Wasn't the budget meeting moved to Thursday?|Yes, that's what I heard.|It's a big budget.|I moved last year.|否定疑問。「そう聞いた」と肯定している。
3|Can we get a discount if we order in bulk?|You'd have to ask the sales team.|We ordered it yesterday.|Yes, it's a bulk.|「営業に聞かないと」は定番の正解パターン。
3|Why don't you take the day off tomorrow?|I have a client meeting.|I took it off.|Because it's Tuesday.|提案に「顧客との打ち合わせがある」と事情を述べて、間接的に断る。
3|The new software is really hard to use.|There's a training video on the intranet.|It's a hard drive.|I used it.|不満を言う平叙文に解決策を示す。
3|Which supplier offered the lower price?|The one from Chicago.|It's lower on the shelf.|They supplied paper.|Which に the one（〜の方）。
3|Will the renovation be finished by May?|It depends on the weather.|It's a nice renovation.|In May of last year.|未来の質問に条件で答える。
3|Didn't you receive my message?|My phone was off all day.|Yes, I'll send it.|It's a long message.|否定疑問に事情で答える間接的な応答。
`;

  // Part 3（会話）・Part 4（説明文）。話者 M/W/W2 は声を分ける、N は1人の話し手
  const P34 = [
    { id: 'c1', lv: 1, kind: 'conv', title: 'プリンターの故障', lines: [
      ['M', "Hi, Karen. The printer on our floor isn't working again."],
      ['W', 'Oh no. I have to print the slides for my presentation at two.'],
      ['M', "You can use the one in the marketing department. It's on the fifth floor."],
      ['W', "Great, thanks. I'll go up there now. Could you call the repair company?"],
      ['M', "Sure, I'll do that right away."]],
      ja: '男：やあカレン、うちの階のプリンターがまた動かないんだ。／女：ええ、2時の発表用のスライドを印刷しないといけないのに。／男：マーケティング部のを使えるよ。5階にある。／女：助かる、すぐ行くわ。修理会社に電話してくれる？／男：もちろん、すぐするよ。',
      qs: [['What problem does the man mention?', 'A printer is not working.', 'A meeting was canceled.', 'Some slides are missing.', 'An elevator is broken.'],
        ['Where does the man suggest the woman go?', 'To the fifth floor', 'To the repair company', 'To a print shop', 'To the first floor'],
        ['What will the man probably do next?', 'Call a repair company', 'Give a presentation', 'Print some slides', 'Visit the marketing department']],
      ex: '「次に何をする？」の答えはたいてい最後のやりとりにある（Could you call…? → I\'ll do that）。' },
    { id: 'c2', lv: 1, kind: 'conv', title: 'レストランの予約', lines: [
      ['W', 'Hello, Bella Cucina. How can I help you?'],
      ['M', "Hi, I'd like to book a table for six people this Friday at seven."],
      ['W', "I'm sorry, we're fully booked at seven. We have a table at eight thirty."],
      ['M', "Eight thirty is fine. Do you have a private room? It's for a business dinner."],
      ['W', "Yes, we do. There's an extra charge of thirty dollars for the room."]],
      ja: '女：はい、ベラ・クチーナです。／男：金曜の7時に6人で予約したいのですが。／女：申し訳ありません、7時は満席です。8時半なら空いています。／男：8時半で大丈夫です。個室はありますか？仕事の会食なんです。／女：ございます。個室は追加で30ドルかかります。',
      qs: [['Why is the man calling?', 'To make a reservation', 'To order food for delivery', 'To complain about a meal', 'To ask for directions'],
        ["What time will the man's group have dinner?", 'At 8:30', 'At 6:00', 'At 7:00', 'At 7:30'],
        ['What does the woman say about the private room?', 'It costs extra.', 'It is already booked.', 'It seats ten people.', 'It is closed on Fridays.']],
      ex: '最初に言った時刻（7時）は満席で、最終的に決まったのは8時半。最初に聞こえた数字に飛びつかない。' },
    { id: 't1', lv: 1, kind: 'talk', title: '空港のアナウンス', lines: [
      ['N', 'Attention, passengers on Flight 207 to Seattle. Because of bad weather in Seattle, this flight has been delayed by about one hour.'],
      ['N', 'The new departure time is 3:45. The departure gate has also changed from Gate 12 to Gate 18. We apologize for the inconvenience.'],
      ['N', 'Passengers can pick up a free drink coupon at the service counter.']],
      ja: 'シアトル行き207便をご利用のお客様にお知らせします。シアトルの悪天候のため、この便は約1時間遅れます。新しい出発時刻は3時45分です。搭乗口も12番から18番に変更になりました。ご迷惑をおかけして申し訳ありません。サービスカウンターで無料のドリンク券をお受け取りいただけます。',
      qs: [['Why has the flight been delayed?', 'Because of bad weather', 'Because of a technical problem', 'Because the crew is late', 'Because of heavy traffic'],
        ['What has changed besides the departure time?', 'The gate', 'The destination', 'The airline', 'The seat numbers'],
        ['What can passengers get at the service counter?', 'A drink coupon', 'A new ticket', 'A meal', 'A hotel room']],
      ex: '空港アナウンスは「理由→新しい時刻・場所→お詫び→特典」の順がお決まり。' },
    { id: 'c3', lv: 2, kind: 'conv', title: '面接の日程', lines: [
      ['M', 'Ms. Carter, this is David Lin from Harbor Tech. We received your application for the web designer position.'],
      ['W', 'Oh, thank you for calling!'],
      ['M', "We'd like to invite you for an interview. Are you available next Tuesday morning?"],
      ['W', "I'm afraid I have another appointment on Tuesday. Would Wednesday work?"],
      ['M', 'Wednesday at ten is open. Please bring some samples of your work.'],
      ['W', "Of course. I'll bring my portfolio."]],
      ja: '男：カーターさん、ハーバー・テックのデイビッド・リンです。ウェブデザイナー職へのご応募を受け取りました。／女：お電話ありがとうございます！／男：面接にお越しいただきたいのですが、来週火曜の午前はいかがですか？／女：あいにく火曜は別の予定が。水曜ではいかがでしょう？／男：水曜10時が空いています。作品のサンプルをお持ちください。／女：もちろんです。ポートフォリオを持っていきます。',
      qs: [['What position did the woman apply for?', 'Web designer', 'Sales manager', 'Receptionist', 'Software engineer'],
        ["Why can't the woman come on Tuesday?", 'She has another appointment.', 'She will be traveling.', 'She is sick.', 'She has to work late.'],
        ['What does the man ask the woman to bring?', 'Samples of her work', 'A reference letter', 'A copy of her ID', 'Her university diploma']],
      ex: 'portfolio（作品集）＝samples of her work の言い換え。Part 3 は会話の語と選択肢の語が言い換えられることが多い。' },
    { id: 'c4', lv: 2, kind: 'conv', title: '事務所の移転（3人）', lines: [
      ['W', "Have you two heard? We're moving to the new building next month."],
      ['M', 'Yes, I heard it has a much bigger cafeteria.'],
      ['W2', "That's true, but it's farther from the train station. My commute will take twenty minutes longer."],
      ['W', 'The company is going to run a free shuttle bus from the station, though.'],
      ['W2', 'Really? That would help a lot.']],
      ja: '女1：聞いた？来月新しいビルに移るのよ。／男：うん、食堂がずっと広いらしいね。／女2：そうだけど、駅から遠くなるの。通勤が20分長くなるわ。／女1：でも会社が駅から無料のシャトルバスを出すそうよ。／女2：本当？それはすごく助かる。',
      qs: [['What are the speakers mainly discussing?', 'An office relocation', 'A new cafeteria menu', 'A train delay', 'A company picnic'],
        ['What is the second woman worried about?', 'Her commute', 'The size of the office', 'Parking fees', 'Her new manager'],
        ['What will the company provide?', 'A shuttle bus', 'Free lunches', 'Train passes', 'Parking spaces']],
      ex: '3人の会話は「誰が言ったか」を問われる。2人目の女性の心配＝通勤時間。' },
    { id: 't2', lv: 2, kind: 'talk', title: '歯医者からの留守電', lines: [
      ['N', "Hi, this is Maria from Green Valley Dental Clinic, calling for Mr. Thomas Reed. I'm calling to remind you of your appointment tomorrow, October 14, at 11 A.M."],
      ['N', 'Please note that our clinic has moved to a new location at 250 Pine Street, right next to the city library.'],
      ['N', 'If you need to change your appointment, please call us at 555-0148 before 5 P.M. today. Thank you.']],
      ja: 'グリーンバレー歯科のマリアです。トーマス・リード様へ。明日10月14日午前11時のご予約の確認のお電話です。当院は市立図書館のすぐ隣、パイン通り250番地に移転しましたのでご注意ください。予約を変更される場合は、本日午後5時までに555-0148までお電話ください。',
      qs: [['What is the purpose of the call?', 'To remind a patient of an appointment', 'To cancel an appointment', 'To introduce a new dentist', 'To ask for a payment'],
        ['What does the speaker say about the clinic?', 'It has moved.', 'It will close early.', 'It has new hours.', 'It is hiring staff.'],
        ['What should the listener do before 5 P.M. to change the appointment?', 'Call the clinic', 'Send an e-mail', 'Visit the library', 'Fill out a form online']],
      ex: '留守電の目的は冒頭の I\'m calling to〜 で言われる。ここを聞き逃さない。' },
    { id: 'c5', lv: 2, kind: 'conv', title: '発売イベントと包装の遅れ', lines: [
      ['M', "Jenny, how's the preparation for the product launch going?"],
      ['W', "Not great. The supplier just told me the packaging won't be ready until the twentieth."],
      ['M', "But the launch event is on the eighteenth. Can't they speed it up?"],
      ['W', "I asked, but their machine broke down. I'm thinking of contacting another company."],
      ['M', 'Good idea. Let me know if you need me to approve any extra costs.']],
      ja: '男：ジェニー、新製品発売の準備はどう？／女：よくないの。包装が20日までできないって業者から連絡があって。／男：でも発売イベントは18日だよ。早められないの？／女：頼んだけど、機械が壊れたんだって。別の会社に当たろうと思ってる。／男：いいね。追加費用の承認が必要なら言って。',
      qs: [['What problem does the woman report?', 'Some packaging will be late.', 'A product is defective.', 'An event was canceled.', 'A price has increased.'],
        ["Why can't the supplier speed up the work?", 'A machine broke down.', 'They are short of staff.', 'They lost the order.', 'Materials are too expensive.'],
        ['What does the man offer to do?', 'Approve extra costs', 'Call the supplier', 'Postpone the launch', 'Design new packaging']],
      ex: 'Let me know if you need me to〜 ＝「〜しましょうか」という申し出。offer を問う設問の定番の答え方。' },
    { id: 't3', lv: 2, kind: 'talk', title: '研修日程の変更', lines: [
      ['N', 'Before we finish, I have a quick update about the staff training. As you know, it was scheduled for next Monday, but the trainer is not available that day, so we\'ve moved it to Thursday afternoon.'],
      ['N', 'It will still be held in Conference Room B. Everyone in the customer service team must attend, so please let your clients know you\'ll be unavailable from one to five.'],
      ['N', 'If you have a scheduling conflict, talk to me by Wednesday.']],
      ja: '終わる前に研修の連絡です。来週月曜の予定でしたが、講師の都合がつかないので木曜の午後に移しました。場所は変わらず会議室Bです。顧客サービスチームは全員参加なので、1時から5時まで対応できないと取引先に伝えておいてください。予定が重なる人は水曜までに私に言ってください。',
      qs: [['What is the main topic of the announcement?', 'A change to a training schedule', 'A new customer service policy', 'The hiring of a trainer', 'The renovation of a room'],
        ['Why was the change made?', 'The trainer is unavailable.', 'The room is being repaired.', 'Clients requested it.', 'Many staff are on vacation.'],
        ['What should listeners with a conflict do?', 'Talk to the speaker by Wednesday', 'E-mail the trainer', 'Choose another date online', 'Inform their clients']],
      ex: 'scheduling conflict（予定の重なり）は Part 3/4・Part 5 の頻出表現。clients に伝えるのは「全員」がやること。' },
    { id: 'c6', lv: 3, kind: 'conv', title: '広告の効果と購入手続き', lines: [
      ['W', 'Kevin, I looked at the numbers from the online ad campaign. Clicks went up forty percent, but sales barely moved.'],
      ['M', 'Hmm. Maybe people are visiting the site but leaving at the payment page.'],
      ['W', "That's what I suspect. Our checkout requires creating an account first."],
      ['M', 'A lot of shoppers hate that. What if we let them check out as guests?'],
      ['W', "I'll talk to the web team, but they're swamped with the app update until next month."],
      ['M', "Well, this should take priority. Every week we wait, we're losing customers."]],
      ja: '女：ケビン、ネット広告の数字を見たの。クリックは40%増えたけど、売上はほとんど動いてない。／男：うーん。サイトには来てるけど支払いページで離脱してるのかも。／女：私もそう思う。購入前にアカウント作成が必要なのよ。／男：あれを嫌がる客は多いね。ゲストで購入できるようにしたら？／女：ウェブチームに話すけど、来月までアプリの更新で手一杯なの。／男：でもこっちを優先すべきだよ。1週間待つごとに客を失ってるんだから。',
      qs: [['What did the woman notice about the campaign?', 'Visits increased but sales did not.', 'It cost more than expected.', 'It reached the wrong audience.', 'It ended too early.'],
        ['What does the man suggest?', 'Allowing guest checkout', 'Ending the ad campaign', 'Lowering prices', 'Hiring more web staff'],
        ['What does the man imply when he says, "this should take priority"?', 'The change should be made before the app update.', 'The ad campaign should be extended.', 'The web team needs a new manager.', 'Customers should create accounts.']],
      ex: '意図問題（What does the man imply…?）は直前の流れで決まる。チームはアプリ更新で忙しい → それより先にやるべき、という意味。' },
    { id: 't4', lv: 3, kind: 'talk', title: '工場見学のガイド', lines: [
      ['N', "Good morning, everyone, and welcome to the Riverside Chocolate Factory tour. My name is Paul, and I'll be your guide today. The tour takes about ninety minutes."],
      ['N', "We'll begin in the history room, then move to the production floor, where you'll see how our chocolate is made. Please note that photography is not allowed on the production floor for safety reasons."],
      ['N', "At the end of the tour, you'll visit our tasting room, where you can try five different flavors. And as a special offer, today's visitors get twenty percent off anything in the gift shop."]],
      ja: 'おはようございます。リバーサイド・チョコレート工場の見学へようこそ。ガイドのポールです。見学は約90分です。歴史の部屋から始めて、製造フロアでチョコレートの作り方をご覧いただきます。安全のため製造フロアでは撮影禁止です。最後に試食室で5種類の味をお試しいただけます。さらに本日の見学者はギフトショップの商品がすべて20%引きです。',
      qs: [['Where most likely are the listeners?', 'At a factory', 'At a museum', 'At a restaurant', 'At a farm'],
        ['What are the listeners asked not to do?', 'Take photographs on the production floor', 'Touch the machines', 'Eat in the tasting room', 'Leave the group'],
        ['What special offer is mentioned?', 'A discount at the gift shop', 'A free box of chocolate', 'A second tour for free', 'Free parking']],
      ex: '「聞き手はどこにいる？」は冒頭の welcome to〜 で決まる。history room に引っぱられて museum を選ばない。' },
    { id: 't5', lv: 3, kind: 'talk', title: 'ラジオの経済ニュース', lines: [
      ['N', 'In business news, Northfield Motors announced today that it will open a new factory in Brazil next year. The plant is expected to create about two thousand jobs and will produce electric vehicles for the South American market.'],
      ['N', "Company spokesperson Lisa Monroe said the decision was driven by growing demand in the region. Northfield's shares rose six percent after the announcement."],
      ['N', 'Stay tuned for an interview with Ms. Monroe after the weather report.']],
      ja: '経済ニュースです。ノースフィールド・モーターズは本日、来年ブラジルに新工場を開くと発表しました。約2000人の雇用を生み、南米市場向けの電気自動車を生産する見込みです。広報のリサ・モンローさんは、地域の需要の高まりが決め手だと述べました。発表後、同社の株価は6%上がりました。このあと天気予報に続いて、モンローさんへのインタビューをお送りします。',
      qs: [['What did Northfield Motors announce?', 'Plans to open a new factory', 'A merger with another company', 'A new CEO', 'A product recall'],
        ['According to the speaker, what caused the decision?', 'Growing demand in the region', 'Lower labor costs', 'A government request', 'Problems at another plant'],
        ['What will listeners hear next?', 'A weather report', 'An interview', 'A sports update', 'An advertisement']],
      ex: 'interview after the weather report ＝ 次は天気予報、その後にインタビュー。順番のひっかけは Part 4 の最後の設問で頻出。' },
    { id: 'c7', lv: 3, kind: 'conv', title: 'ホテルへの苦情', lines: [
      ['M', 'Excuse me, I checked in last night, and the air conditioner in my room is making a lot of noise. I barely slept.'],
      ['W', "I'm very sorry to hear that, sir. I can send a technician up right away."],
      ['M', "I have meetings all day, so I'd rather just change rooms."],
      ['W', 'Of course. We have a room available on the twelfth floor. And to make up for the trouble, breakfast will be complimentary during your stay.'],
      ['M', "That's very kind. I'll pack my things during my lunch break."]],
      ja: '男：すみません、昨夜チェックインしたのですが、部屋のエアコンがすごくうるさくて、ほとんど眠れませんでした。／女：大変申し訳ございません。すぐに技術者を伺わせます。／男：一日中会議なので、部屋を替えてもらう方がいいです。／女：かしこまりました。12階にお部屋がございます。お詫びに、ご滞在中の朝食は無料とさせていただきます。／男：ありがとうございます。昼休みに荷物をまとめます。',
      qs: [["What is the man's problem?", 'His air conditioner is noisy.', 'His room is too small.', 'He lost his key.', 'His bill is incorrect.'],
        ['What does the woman offer?', 'Free breakfast', 'A discount on the room', 'A late checkout', 'A free taxi'],
        ['What will the man do during lunch?', 'Pack his belongings', 'Meet a technician', 'Eat at the hotel restaurant', 'Check out of the hotel']],
      ex: 'complimentary＝無料の。技術者は「申し出たが断られた」ので、男性が会う相手ではない。' },
  ];

  // Part 7（読解）。doc.kind: notice / ad / email / chat / article
  const P7 = [
    { id: 'r1', lv: 1, docs: [{ kind: 'notice', title: 'NOTICE', body: 'The fitness center on the first floor will be closed from Monday, June 3, to Friday, June 7, for the installation of new equipment. During this time, members may use the pool and the sauna as usual. The fitness center will reopen on Saturday, June 8, at 6:00 A.M. We are sorry for any inconvenience.\n— Management Office' }],
      ja: '【お知らせ】1階のフィットネスセンターは、新しい機器の設置のため6月3日（月）から6月7日（金）まで閉鎖します。期間中もプールとサウナは通常どおりご利用いただけます。フィットネスセンターは6月8日（土）午前6時に再開します。ご不便をおかけして申し訳ありません。— 管理事務所',
      qs: [['Why will the fitness center be closed?', 'New equipment will be installed.', 'The pool is being cleaned.', 'Staff will be trained.', 'The building is being painted.'],
        ['What can members do during the closure?', 'Use the pool', 'Get a refund', 'Use a gym in another building', 'Take free lessons']],
      ex: 'for the installation of new equipment ＝ 新しい機器が設置される。本文の名詞が選択肢では動詞（be installed）に言い換えられている。' },
    { id: 'r2', lv: 1, docs: [{ kind: 'ad', title: 'Sunny Days Bakery — Now Open!', body: 'Visit our new store at 18 Maple Avenue! We bake fresh bread, cakes, and cookies every morning.\nOpening hours: 7 A.M. to 7 P.M., Tuesday through Sunday (closed Mondays)\nGrand opening special: Buy any two items and get a free coffee. This offer is valid until April 30.\nOrder birthday cakes online at www.sunnydaysbakery.com.' }],
      ja: '【サニーデイズ・ベーカリー 新規オープン！】メープル通り18番地の新店舗へどうぞ！毎朝焼きたてのパン、ケーキ、クッキーをご用意しています。営業時間：午前7時〜午後7時、火曜〜日曜（月曜定休）。オープン記念：どれでも2点お買い上げでコーヒー1杯無料。4月30日まで。誕生日ケーキはウェブサイトでご注文いただけます。',
      qs: [['When is the bakery closed?', 'On Mondays', 'On Sundays', 'On Tuesdays', 'On weekends'],
        ['How can customers get a free coffee?', 'By buying two items', 'By ordering online', 'By visiting before 8 A.M.', 'By bringing a coupon'],
        ['What can customers order online?', 'Birthday cakes', 'Bread', 'Cookies', 'Coffee beans']],
      ex: '広告は「場所・営業時間・特典・期限・注文方法」を探す読み方でよい。全部読まなくても答えは拾える。' },
    { id: 'r3', lv: 1, docs: [{ kind: 'notice', title: 'City Bus Route 5 — Weekend Schedule Change', body: 'From July 1, Route 5 buses will run every 30 minutes on Saturdays and Sundays instead of every 20 minutes. Weekday service will not change. The first bus will leave Central Station at 6:30 A.M., and the last bus will leave at 11:00 P.M. For the full timetable, visit the city transportation website or pick up a copy at any station office.' }],
      ja: '【市バス5番系統 週末ダイヤ変更】7月1日から、5番系統のバスは土日に20分間隔ではなく30分間隔で運行します。平日は変わりません。始発は中央駅を午前6時30分、最終は午後11時に出発します。全時刻表は市交通局のウェブサイトか、各駅の窓口でお受け取りください。',
      qs: [['What will change on July 1?', 'How often weekend buses run', 'Bus fares', 'The route of the bus', 'Weekday service'],
        ['Where can people get a full timetable?', 'On a website or at a station office', 'On the bus', 'At City Hall', 'By calling the driver']],
      ex: 'every 30 minutes instead of every 20 minutes ＝ 運行の頻度（how often）が変わる。' },
    { id: 'r4', lv: 2, docs: [{ kind: 'email', head: ['To: All Staff', 'From: Rachel Moore, Human Resources', 'Date: September 2', 'Subject: Annual health checkups'], body: "Dear Staff,\nThis year's health checkups will take place on September 20 and 21 in Meeting Rooms 3 and 4. Each checkup takes about forty minutes. Please sign up for a time slot on the HR page of the intranet by September 12.\nThose who cannot attend on either day should contact me directly so that we can arrange an appointment at Westside Clinic.\nPlease do not eat anything for eight hours before your checkup. Water is fine.\nThank you,\nRachel Moore" }],
      ja: '全社員へ。今年の健康診断は9月20日と21日に会議室3・4で行います。1人約40分です。9月12日までに社内サイトの人事ページで時間枠を予約してください。どちらの日も来られない人は、ウエストサイド・クリニックでの予約を手配しますので、私に直接連絡してください。健診の8時間前から何も食べないでください。水は大丈夫です。— 人事部 レイチェル・ムーア',
      qs: [['What is the purpose of the e-mail?', 'To give information about health checkups', 'To announce a new clinic', 'To introduce a new HR manager', 'To change a meeting room'],
        ['What should employees do by September 12?', 'Sign up online', 'Visit Westside Clinic', 'Submit a medical form', 'Contact their manager'],
        ['What should employees who cannot come on either day do?', 'Contact Ms. Moore', 'Go to Meeting Room 3', 'Skip the checkup', 'Call Westside Clinic directly'],
        ['What is NOT allowed before the checkup?', 'Eating food', 'Drinking water', 'Using the intranet', 'Coming to the office']],
      ex: 'NOT 問題は選択肢を1つずつ本文と照らす。「水は大丈夫」なので Drinking water は許されている → 許されないのは食べること。' },
    { id: 'r5', lv: 2, docs: [{ kind: 'chat', lines: [['Tom Baker', '9:12', 'Hi Ana, are you at the office yet? The client from Lyon just arrived early.'], ['Ana Silva', '9:13', "I'm on the train. I'll be there in twenty minutes."], ['Tom Baker', '9:14', 'OK. Where did you put the contract copies?'], ['Ana Silva', '9:15', "They're in the blue folder on my desk."], ['Tom Baker', '9:15', "Got it. I'll show him the showroom first."], ['Ana Silva', '9:16', "Perfect. That'll give me time."]] }],
      ja: 'トム（9:12）：アナ、もう会社？リヨンのお客さんが早く着いちゃった。／アナ（9:13）：電車の中。20分で着く。／トム（9:14）：了解。契約書のコピーはどこ？／アナ（9:15）：私の机の青いフォルダーの中。／トム（9:15）：分かった。先にショールームを案内しておくよ。／アナ（9:16）：完璧。それなら間に合う。',
      qs: [['Why does Mr. Baker contact Ms. Silva?', 'A client arrived earlier than expected.', 'A contract was lost.', 'A train was delayed.', 'A meeting was canceled.'],
        ['At 9:16, what does Ms. Silva mean when she writes, "That\'ll give me time"?', 'She can arrive before the meeting starts.', 'She needs time to write a contract.', 'She wants to see the showroom.', 'She will take a later train.'],
        ['Where are the contract copies?', "On Ms. Silva's desk", 'In the showroom', 'On the train', "In Mr. Baker's office"]],
      ex: 'チャットの意図問題は、その発言の直前を読む。トムがショールームを案内する → その間にアナが到着できる。' },
    { id: 'r6', lv: 2, docs: [{ kind: 'article', title: 'Local Library Adds Weekend Hours', body: 'Starting next month, the Fairview Public Library will be open on Sundays from 10 A.M. to 4 P.M. Until now, the library has been closed on Sundays.\nLibrary director Helen Price said the change was made in response to a survey in which more than 60 percent of residents asked for weekend hours. "Many people work during the week, so Sunday is the only day they can visit," Ms. Price explained.\nTo cover the additional hours, the library has hired three part-time staff members. The library will also hold a free storytelling event for children on the first Sunday of each month.' }],
      ja: '【地元の図書館、週末も開館へ】来月からフェアビュー公共図書館は日曜日も午前10時〜午後4時に開館する。これまで日曜は休館だった。館長のヘレン・プライス氏によると、住民の6割以上が週末の開館を求めたアンケートを受けての変更だという。「平日は働いている人が多く、日曜しか来られないのです」と同氏。増えた時間をまかなうため、図書館はパート職員を3人雇った。また毎月第1日曜日には子ども向けの無料の読み聞かせ会を開く。',
      qs: [['What is the article mainly about?', 'New library opening hours', 'A new library building', 'A reading contest', 'A library budget cut'],
        ['Why did the library make the change?', 'Residents requested it.', 'The director was replaced.', 'The city provided funding.', 'The building was renovated.'],
        ['What will happen on the first Sunday of each month?', "A children's event will be held.", 'The library will close early.', 'New books will be sold.', 'Volunteers will be trained.']],
      ex: '記事の主題はタイトルと第1段落。in response to a survey…asked for ＝ 住民が求めた（requested）。' },
    { id: 'r7', lv: 2, docs: [{ kind: 'ad', title: 'Job Opening: Front Desk Assistant — Lakeview Hotel', body: 'Lakeview Hotel is looking for a full-time front desk assistant. Duties include checking guests in and out, answering phone calls, and handling reservations.\nApplicants should have at least one year of customer service experience. Knowledge of a second language is preferred but not required. Shifts include some weekends and holidays.\nTo apply, send your resume and a cover letter to the HR office by August 15. Only applicants selected for an interview will be contacted.' }],
      ja: '【求人：フロント係 — レイクビュー・ホテル】フルタイムのフロント係を募集します。業務はチェックイン・チェックアウト、電話応対、予約の管理です。顧客サービスの経験が1年以上必要です。第二言語ができれば尚可（必須ではありません）。週末・祝日の勤務あり。応募は8月15日までに履歴書と添え状を人事部へ。面接対象者にのみご連絡します。',
      qs: [['What is NOT mentioned as a duty of the job?', 'Cleaning guest rooms', 'Answering phone calls', 'Handling reservations', 'Checking guests in'],
        ['What is a requirement for the position?', 'Customer service experience', 'Knowledge of a second language', 'A university degree', "A driver's license"],
        ['What is indicated about the application process?', 'Not all applicants will be contacted.', 'Applicants must apply in person.', 'Interviews will be held on August 15.', 'Applicants need two references.']],
      ex: 'preferred but not required ＝ 必須ではない → 要件（requirement）は経験の方。Only applicants selected…will be contacted ＝ 全員には連絡しない。' },
    { id: 'r8', lv: 3, docs: [{ kind: 'email', head: ['To: Customer Service, Bright Office Supply', 'From: Daniel Wu, Lakeside Design', 'Date: May 15', 'Subject: Order #48213'], body: 'Dear Customer Service,\nOn May 8, I ordered 12 office chairs (model EC-200) for our new office. The shipment arrived yesterday, but only 10 chairs were included, and two of them have damaged armrests.\nAccording to your website, damaged items can be exchanged free of charge within 14 days. I would like to exchange the two damaged chairs and receive the two missing ones as soon as possible, as our staff will move into the new office on May 20.\nI have attached photos of the damage and a copy of the packing slip. Please let me know how you would like to proceed.\nSincerely,\nDaniel Wu\nOffice Manager, Lakeside Design' }],
      ja: 'カスタマーサービス御中。5月8日に新事務所用の椅子（EC-200）を12脚注文しました。昨日届きましたが10脚しか入っておらず、うち2脚はひじ掛けが壊れていました。御社サイトによると、破損品は14日以内なら無料で交換できるとのこと。社員が5月20日に新事務所へ移るので、壊れた2脚の交換と足りない2脚の送付をできるだけ早くお願いします。破損の写真と納品書のコピーを添付しました。どう進めればよいかお知らせください。— レイクサイド・デザイン 総務 ダニエル・ウー',
      qs: [['Why did Mr. Wu write the e-mail?', 'To report a problem with an order', 'To place a new order', 'To cancel an order', 'To ask about a price'],
        ['How many chairs in good condition did Mr. Wu receive?', '8', '10', '12', '2'],
        ['What is indicated about the new office?', 'Staff will move in on May 20.', 'It is located near the store.', 'It needs more desks.', 'It opened on May 8.'],
        ['What did Mr. Wu include with the e-mail?', 'Photos and a packing slip', 'A receipt and a credit card number', 'A new order form', 'A map of the office']],
      ex: '10脚届いて2脚が破損 → 無事なのは8脚。数字は本文に直接書かれず、計算させるのが上級の出題。' },
    { id: 'r9', lv: 3, docs: [
      { kind: 'ad', title: 'Harbor View Conference Center — Room Rates', body: 'Room A (up to 20 people): $200 per day\nRoom B (up to 50 people): $450 per day\nRoom C (up to 120 people): $900 per day\nAll rooms include a projector and free Wi-Fi. Catering is available for an additional fee. Bookings made more than 60 days in advance receive a 10% discount.' },
      { kind: 'email', head: ['To: Bookings, Harbor View Conference Center', 'From: Emily Stone, Peak Software', 'Date: March 3', 'Subject: Booking request'], body: "Hello,\nI would like to book a room for our company's training day on June 12. We expect about 40 participants. We will also need lunch for everyone. Could you send me a menu and a price estimate?\nSince we are booking well in advance, I assume the discount applies.\nBest regards,\nEmily Stone" }],
      ja: '【文書1：料金表】A室（20人まで）1日200ドル、B室（50人まで）450ドル、C室（120人まで）900ドル。全室プロジェクターと無料Wi-Fi付き。ケータリングは別料金。60日以上前の予約は10%割引。【文書2：メール 3月3日】6月12日の社内研修日に部屋を予約したいです。参加者は約40人。全員分の昼食も必要です。メニューと見積もりを送ってください。かなり前もっての予約なので割引が適用されると思います。— ピーク・ソフトウェア エミリー・ストーン',
      qs: [['Which room will Ms. Stone most likely book?', 'Room B', 'Room A', 'Room C', 'All three rooms'],
        ['What does Ms. Stone request?', 'A menu and an estimate', 'A projector', 'A tour of the center', 'A discount code'],
        ["What is indicated about Ms. Stone's booking?", 'It will receive a 10% discount.', 'It includes a free lunch.', 'It is for one week.', 'It was made by phone.']],
      ex: '複数文書は「2つを組み合わせないと解けない設問」が必ず出る。40人 → B室（50人まで）。3月3日 → 6月12日は60日以上前 → 割引あり。' },
    { id: 'r10', lv: 3, docs: [{ kind: 'article', title: 'Greenway Foods Expands Delivery Service', body: 'Greenway Foods, a grocery chain based in Portland, announced on Monday that it will expand its home delivery service to twelve more cities by the end of the year. The company first introduced delivery three years ago and has seen orders triple since then.\nCEO Mark Hollis credited the growth to the company\'s focus on fresh, locally grown produce. "Our customers know that what arrives at their door was on a farm just a day or two earlier," he said.\nTo support the expansion, Greenway will open two new distribution centers and hire around 500 drivers. However, some analysts question whether the company can maintain its quality standards while growing so quickly.' }],
      ja: '【グリーンウェイ・フーズ、宅配サービスを拡大】ポートランドを拠点とする食品スーパーのグリーンウェイ・フーズは月曜日、年末までに宅配サービスをさらに12都市に広げると発表した。同社は3年前に宅配を始め、以来注文は3倍になった。マーク・ホリスCEOは、成長の要因を新鮮な地元産の農産物へのこだわりにあるとした。「玄関に届くものが1〜2日前まで畑にあったことを、お客様は知っています」。拡大のため、物流センターを2か所新設し、運転手を約500人雇う。ただし、急成長しながら品質基準を保てるのか疑問視するアナリストもいる。',
      qs: [['What is the main purpose of the article?', "To report a company's expansion plans", 'To review a new restaurant', 'To announce a new CEO', 'To compare grocery prices'],
        ['The word "credited" in paragraph 2, line 1, is closest in meaning to', 'attributed', 'paid', 'trusted', 'lent'],
        ['What concern do some analysts have?', 'Quality may decline as the company grows.', 'Delivery prices may rise.', 'Drivers may be hard to find.', 'Farms may raise prices.'],
        ['How have orders changed since delivery was introduced?', 'They have tripled.', 'They have doubled.', 'They have decreased.', 'They have stayed the same.']],
      ex: '同義語問題は辞書の意味でなく文中の意味で選ぶ。credit A to B＝AをBのおかげとする ＝ attribute。' },
  ];

  // ---- 解析 ----
  const words = [];
  for (const [band, txt] of Object.entries(W)) {
    for (const line of txt.trim().split('\n')) {
      const [w, pos, ja, ex, exJa] = line.split('|');
      const m = ex.match(/\*([^*]+)\*/);
      words.push({ id: w, w, pos, ja, ex: ex.replace(/\*/g, ''), form: m ? m[1] : w, exJa, band: +band });
    }
  }
  const p5 = P5.trim().split('\n').map((line, i) => { const [lv, cat, q, ch, ...ex] = line.split('|'); return { id: 'p5.' + i, lv: +lv, cat, q, choices: ch.split(';'), ex: ex.join('|') }; });
  const p2 = P2.trim().split('\n').map((line, i) => { const [lv, q, a, w1, w2, ...ex] = line.split('|'); return { id: 'p2.' + i, lv: +lv, q, choices: [a, w1, w2], ex: ex.join('|') }; });
  const p34 = P34.map((s) => Object.assign({}, s, { id: 'p34.' + s.id, qs: s.qs.map((q) => ({ q: q[0], choices: q.slice(1) })) }));
  const p7 = P7.map((s) => Object.assign({}, s, { id: 'p7.' + s.id, qs: s.qs.map((q) => ({ q: q[0], choices: q.slice(1) })) }));

  // ---- 「900点ロード」の教材を合流する（src/toeic-extra。同じ単語は先に入っている方を残す） ----
  const X = typeof TOEIC_EXTRA !== 'undefined' ? TOEIC_EXTRA : (typeof require === 'function' ? require('./toeic-extra/load.js') : null);
  let grammar = [];
  if (X) {
    const POS = { n: '名', v: '動', a: '形', ad: '副', p: '前', c: '接' };
    const BAND = { 1: 300, 2: 450, 3: 600, 4: 730, 5: 860, 6: 990 };
    const lv3 = (lv) => (lv <= 2 ? 1 : lv <= 4 ? 2 : 3);
    const TAGCAT = { 品詞: 'pos', 代名詞: 'pron', 前置詞: 'prep', '前置詞・接続詞': 'prep', 関係詞: 'rel', 語彙: 'vocab', 比較: 'comp' };
    const rows = (t) => t.trim().split('\n').map((x) => x.trim()).filter((x) => x && !x.startsWith('#'));
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const have = new Set(words.map((w) => w.id.toLowerCase()));
    for (const [lv, txt] of Object.entries(X.VOCAB)) for (const line of rows(txt)) {
      const [en, pos, ja, ex = ''] = line.split('|').map((x) => x.trim());
      if (!en || have.has(en.toLowerCase())) continue; have.add(en.toLowerCase());
      const m = ex.match(new RegExp('\\b' + esc(en) + '\\b', 'i'));
      words.push({ id: en, w: en, pos: POS[pos] || '名', ja: ja.replace(/、/g, '・'), ex, form: m ? m[0] : null, exJa: '', band: BAND[lv] || 600, src: 'x' });
    }
    words.sort((a, b) => a.band - b.band); // 帯の順（同じ帯の中は元の順）
    const firstOf = (c, a) => [c[a], ...c.filter((_, k) => k !== a)];
    rows(X.P5).forEach((line, i) => {
      const [tag, lv, q, c1, c2, c3, c4, a, ...ex] = line.split('|').map((x) => x.trim());
      p5.push({ id: 'x5.' + i, lv: lv3(+lv), cat: TAGCAT[tag] || 'verb', tag, q: q.replace(/_{3,}/, '-------'), choices: firstOf([c1, c2, c3, c4], +a), ex: ex.join('|') });
    });
    rows(X.P2).forEach((line, i) => {
      const [lv, q, c1, c2, c3, a, ...ja] = line.split('|').map((x) => x.trim());
      p2.push({ id: 'x2.' + i, lv: lv3(+lv), q, choices: firstOf([c1, c2, c3], +a), ex: ja.join('|') });
    });
    const exOf = (qs) => qs.map((q, k) => `${k + 1}. ${q.ex}`).join('\n');
    X.P34.forEach((o, i) => p34.push({ id: 'p34.x' + i, lv: lv3(o.lv), kind: o.kind, title: '', lines: o.lines, ja: o.ja, qs: o.qs.map((q) => ({ q: q.q, choices: firstOf(q.c, q.a) })), ex: exOf(o.qs) }));
    const kindOf = (t) => (/mail/i.test(t) ? 'email' : /advert/i.test(t) ? 'ad' : /article/i.test(t) ? 'article' : 'notice');
    X.P7.forEach((o, i) => p7.push({ id: 'p7.x' + i, lv: lv3(o.lv), label: o.title, docs: [{ kind: kindOf(o.title), title: '', body: o.text, pre: true }], ja: '', qs: o.qs.map((q) => ({ q: q.q, choices: firstOf(q.c, q.a) })), ex: exOf(o.qs) }));
    grammar = X.LESSONS.map((g) => Object.assign({}, g, { cat: TAGCAT[g.tag] || null }));
  }
  return { words, p5, p2, p34, p7, grammar };
})();
if (typeof module !== 'undefined') module.exports = TOEIC_DATA;
