// 単語：英語|品詞|意味|例。品詞 n名 v動 a形 ad副 p前 c接。意味が近い語は「、」区切りの意味を1つ共有させる（誤答候補から外れる）
const VOCAB = {};
VOCAB[1] = `
work|v|働く|work at a bank
go|v|行く|go to work
come|v|来る|come to the office
make|v|作る|make a list
take|v|取る、（時間が）かかる|take a bus
get|v|得る、手に入れる|get a ticket
give|v|与える|give a talk
have|v|持っている|have a car
see|v|見る、会う|see a doctor
know|v|知っている|know the answer
think|v|思う、考える|think about the plan
want|v|欲しい、〜したい|want to buy a car
need|v|必要とする|need more time
use|v|使う|use a computer
help|v|手伝う、助ける|help a customer
call|v|電話する、呼ぶ|call the office
ask|v|たずねる、頼む|ask a question
tell|v|伝える、教える|tell him the news
buy|v|買う|buy a ticket
sell|v|売る|sell books
pay|v|支払う|pay the bill
send|v|送る|send an e-mail
write|v|書く|write a letter
read|v|読む|read the newspaper
open|v|開ける、開く|open the window
close|v|閉める|close the door
start|v|始める、始まる|start a business
finish|v|終える|finish the work
leave|v|出発する、去る|leave the office
arrive|v|到着する|arrive at the station
meet|v|会う、出迎える|meet a client
wait|v|待つ|wait for a bus
move|v|動かす、引っ越す|move to Tokyo
bring|v|持ってくる、連れてくる|bring your lunch
carry|v|運ぶ|carry a box
show|v|見せる|show your ticket
try|v|試す|try a new dish
look|v|見る、〜に見える|look at the screen
listen|v|聞く、耳を傾ける|listen to music
speak|v|話す|speak English
learn|v|学ぶ、習う|learn a new skill
teach|v|教える|teach English
visit|v|訪問する|visit a factory
stay|v|滞在する|stay at a hotel
live|v|住む|live in Osaka
change|v|変える|change the schedule
check|v|確認する|check the e-mail
order|v|注文する|order lunch
book|v|予約する|book a table
clean|v|掃除する|clean the room
drive|v|運転する|drive a car
walk|v|歩く|walk to work
sit|v|座る|sit at a desk
stand|v|立つ|stand in line
put|v|置く|put the box on the table
keep|v|保つ、とっておく|keep the door open
join|v|加わる|join a team
cook|v|料理する|cook dinner
office|n|事務所、職場|a branch office
company|n|会社|a large company
job|n|仕事|a new job
money|n|お金|save money
time|n|時間、時刻|on time
week|n|週|next week
month|n|月（暦の）|last month
year|n|年|this year
morning|n|朝、午前|this morning
afternoon|n|午後|in the afternoon
evening|n|夕方、晩|tomorrow evening
hour|n|1時間|for an hour
minute|n|分|ten minutes
station|n|駅|a train station
store|n|店|a grocery store
restaurant|n|レストラン|a Japanese restaurant
hotel|n|ホテル|a hotel room
room|n|部屋|a meeting room
desk|n|机|on the desk
table|n|テーブル|a table for two
chair|n|いす|sit on a chair
door|n|ドア|open the door
window|n|窓|by the window
floor|n|床、（建物の）階|the third floor
building|n|建物|an office building
city|n|都市|a big city
country|n|国|a foreign country
car|n|車|a rental car
train|n|電車|by train
plane|n|飛行機|by plane
ticket|n|切符、チケット|a train ticket
map|n|地図|a city map
phone|n|電話|answer the phone
computer|n|コンピューター|a new computer
paper|n|紙、書類|a sheet of paper
letter|n|手紙|write a letter
name|n|名前|your name
number|n|数、番号|a phone number
price|n|価格|a low price
food|n|食べ物|Japanese food
water|n|水|a glass of water
lunch|n|昼食|have lunch
dinner|n|夕食|dinner with clients
breakfast|n|朝食|Breakfast is included.
friend|n|友人|a close friend
family|n|家族|my family
child|n|子ども|two children
people|n|人々|many people
student|n|学生|a college student
teacher|n|先生|an English teacher
doctor|n|医者|see a doctor
customer|n|客、顧客|a regular customer
boss|n|上司|my boss
team|n|チーム|a sales team
school|n|学校|after school
park|n|公園|a city park
street|n|通り|on Main Street
weather|n|天気|nice weather
question|n|質問|ask a question
answer|n|答え|the right answer
idea|n|考え、アイデア|a good idea
problem|n|問題|solve a problem
list|n|一覧、リスト|a shopping list
picture|n|写真、絵|take a picture
music|n|音楽|listen to music
new|a|新しい|a new product
old|a|古い、年を取った|an old building
big|a|大きい|a big room
small|a|小さい|a small town
good|a|良い|good news
bad|a|悪い|bad weather
long|a|長い|a long meeting
short|a|短い|a short break
early|a|早い|an early flight
late|a|遅い、遅れた|be late for work
busy|a|忙しい|a busy week
free|a|自由な、無料の|free tickets
easy|a|簡単な|an easy question
difficult|a|難しい|a difficult job
important|a|重要な|an important meeting
ready|a|準備ができた|be ready to go
happy|a|うれしい、幸せな|be happy to help
expensive|a|高価な|an expensive hotel
cheap|a|安い|a cheap ticket
next|a|次の|the next train
last|a|最後の、この前の|last year
same|a|同じ|the same day
different|a|違う、異なる|a different color
famous|a|有名な|a famous writer
hot|a|暑い、熱い|a hot day
cold|a|寒い、冷たい|cold water
full|a|いっぱいの|The bus is full.
right|a|正しい、右の|the right answer
always|ad|いつも|always on time
usually|ad|ふだんは|usually take the bus
often|ad|よく、しばしば|often work late
sometimes|ad|ときどき|sometimes eat out
never|ad|一度も〜ない|never late
again|ad|もう一度|try again
soon|ad|すぐに、まもなく|see you soon
today|ad|今日（は）|open today
tomorrow|ad|明日（は）|tomorrow morning
yesterday|ad|昨日（は）|yesterday afternoon
here|ad|ここに|come here
there|ad|そこに|over there
near|p|〜の近くに|near the station
before|p|〜の前に|before lunch
after|p|〜の後に|after work
during|p|〜の間に（特定の期間）|during the meeting
between|p|（2つの）間に|between 3 and 5 p.m.
because|c|〜なので|because it rained
but|c|しかし|small but useful
or|c|または|tea or coffee
if|c|もし〜なら|if you need help
when|c|〜するとき|when you arrive
`;
VOCAB[2] = `
attend|v|出席する|attend a meeting
borrow|v|借りる|borrow a book
lend|v|貸す|lend him money
return|v|戻る、返す|return the book
choose|v|選ぶ|choose a color
decide|v|決める|decide to go
explain|v|説明する|explain the rule
agree|v|同意する|agree with you
believe|v|信じる|believe the news
remember|v|覚えている、思い出す|remember the name
forget|v|忘れる|forget the password
hope|v|望む|hope to see you
worry|v|心配する|worry about the cost
enjoy|v|楽しむ|enjoy the party
invite|v|招待する|invite a guest
prepare|v|準備する|prepare a report
practice|v|練習する|practice English
repair|v|修理する|repair a car
fix|v|修理する、固定する|fix the printer
reserve|v|（席・部屋を）予約する|reserve a room
deliver|v|配達する|deliver a package
receive|v|受け取る|receive a letter
include|v|含む|include tax
travel|v|旅行する|travel abroad
improve|v|改善する、向上させる|improve service
increase|v|増える、増やす|increase sales
decrease|v|減る、減らす|decrease costs
produce|v|生産する|produce cars
offer|v|提供する、申し出る|offer a discount
provide|v|供給する、提供する|provide information
contact|v|連絡する|contact the manager
apply|v|申し込む、応募する|apply for a job
hire|v|雇う|hire new staff
manage|v|管理する、経営する|manage a store
report|v|報告する|report the results
discuss|v|話し合う|discuss the plan
complete|v|完成させる、（用紙に）記入し終える|complete a form
continue|v|続ける|continue working
cancel|v|取り消す、中止する|cancel an order
confirm|v|確認する|confirm a reservation
print|v|印刷する|print a document
share|v|共有する|share an office
grow|v|成長する、育てる|grow quickly
develop|v|開発する、発展させる|develop a product
sign|v|署名する|sign a contract
rent|v|賃借りする、賃貸しする|rent a car
save|v|節約する、保存する|save time
spend|v|（時間・お金を）使う、過ごす|spend money
cost|v|（費用が）かかる|It costs ten dollars.
turn|v|曲がる、回す|turn left
follow|v|ついて行く、従う|follow the instructions
fill|v|満たす、記入する|fill out a form
hold|v|持つ、開催する|hold a meeting
lead|v|導く、率いる|lead a team
miss|v|乗り遅れる、逃す|miss the train
lose|v|失う、負ける|lose a key
win|v|勝つ、獲得する|win an award
meeting|n|会議|a staff meeting
schedule|n|予定、スケジュール|a busy schedule
client|n|顧客、依頼人|meet a client
manager|n|部長、管理者|a store manager
employee|n|従業員|a new employee
staff|n|職員（全体）|hotel staff
salary|n|給料|a high salary
event|n|行事、イベント|a company event
project|n|計画、事業|a new project
product|n|製品|a new product
service|n|サービス、業務|customer service
sale|n|販売、特売|on sale
information|n|情報|more information
document|n|書類、文書|sign a document
form|n|用紙、形式|an application form
package|n|小包|send a package
delivery|n|配達|free delivery
address|n|住所|an e-mail address
area|n|地域、区域|a parking area
airport|n|空港|at the airport
flight|n|（飛行機の）便|a direct flight
trip|n|旅行、出張|a business trip
passenger|n|乗客|airline passengers
museum|n|美術館、博物館|an art museum
library|n|図書館|a public library
hospital|n|病院|go to the hospital
bank|n|銀行|a bank account
account|n|口座、アカウント|open an account
department|n|部署、売り場|the sales department
factory|n|工場|a car factory
machine|n|機械|a copy machine
item|n|品物、項目|an item on the list
receipt|n|領収書、レシート|keep the receipt
discount|n|割引|a 10% discount
advertisement|n|広告|a newspaper advertisement
interview|n|面接、インタビュー|a job interview
experience|n|経験|work experience
skill|n|技能、スキル|computer skills
result|n|結果|test results
reason|n|理由|the reason for the delay
example|n|例|for example
size|n|大きさ、サイズ|a larger size
type|n|種類、型|a new type of phone
part|n|部分、部品|car parts
corner|n|角|on the corner
traffic|n|交通（量）|heavy traffic
vacation|n|休暇|summer vacation
holiday|n|祝日、休日|a national holiday
available|a|利用できる、手が空いている|available rooms
popular|a|人気のある|a popular restaurant
special|a|特別な|a special offer
local|a|地元の|a local newspaper
public|a|公共の|public transportation
international|a|国際的な|an international company
online|a|オンラインの|an online store
heavy|a|重い、（量が）多い|heavy rain
quiet|a|静かな|a quiet room
convenient|a|便利な、都合のよい|a convenient time
comfortable|a|快適な|a comfortable chair
necessary|a|必要な|necessary documents
possible|a|可能な|as soon as possible
several|a|いくつかの|several times
each|a|それぞれの|each employee
whole|a|全体の|the whole day
main|a|主な|the main office
recent|a|最近の|recent changes
final|a|最終の|the final decision
total|a|合計の|the total cost
extra|a|追加の、余分な|an extra charge
daily|a|毎日の|daily work
safe|a|安全な|a safe place
already|ad|すでに|has already left
still|ad|まだ、今でも|still working
almost|ad|ほとんど|almost finished
only|ad|〜だけ|only one day
also|ad|〜もまた|also available
together|ad|一緒に|work together
abroad|ad|海外へ|study abroad
recently|ad|最近|recently opened
until|p|〜まで（ずっと）|until 5 p.m.
by|p|〜までに、〜によって|by Friday
since|p|〜以来|since 2020
across|p|〜を横切って、〜の向こう側に|across the street
through|p|〜を通って|through the door
although|c|〜だけれども|although it was late
while|c|〜する間に|while you wait
unless|c|〜しない限り|unless it rains
`;
VOCAB[3] = `
require|v|要求する、必要とする|Passengers are required to show ID.
submit|v|提出する|submit a report
review|v|見直す、検討する|review the contract
approve|v|承認する|approve the budget
announce|v|発表する|announce a new product
launch|v|（新製品を）発売する、開始する|launch a campaign
expand|v|拡大する|expand the business
replace|v|取り替える|replace the battery
install|v|設置する、インストールする|install new software
inspect|v|検査する|inspect the equipment
purchase|v|購入する|purchase tickets online
ship|v|発送する|ship the order
arrange|v|手配する、並べる|arrange a meeting
organize|v|準備する、組織する|organize an event
postpone|v|延期する|postpone the meeting
extend|v|延長する|extend the deadline
reduce|v|減らす|reduce costs
recommend|v|勧める|recommend a restaurant
remind|v|思い出させる|remind him of the meeting
notify|v|知らせる、通知する|notify customers
register|v|登録する|register for a seminar
participate|v|参加する|participate in a workshop
conduct|v|行う、実施する|conduct a survey
attach|v|添付する|attach a file
indicate|v|示す|indicate a problem
estimate|v|見積もる|estimate the cost
predict|v|予測する、予想する|predict sales
assist|v|手伝う、補助する|assist customers
handle|v|扱う、処理する|handle complaints
update|v|更新する|update the website
renovate|v|改装する|renovate the lobby
relocate|v|移転する|relocate the office
assign|v|割り当てる|assign a task
promote|v|昇進させる、宣伝する|be promoted to manager
retire|v|退職する|retire next year
recruit|v|（人材を）募集する|recruit engineers
negotiate|v|交渉する|negotiate a contract
afford|v|〜する余裕がある|can afford a new car
encourage|v|励ます、促す|encourage staff to attend
ensure|v|確実にする|ensure safety
maintain|v|維持する、保守する|maintain equipment
operate|v|操作する、営業する|operate a machine
measure|v|測る|measure the room
compare|v|比べる|compare prices
describe|v|説明する、描写する|describe the problem
respond|v|返答する、対応する|respond to an e-mail
budget|n|予算|a limited budget
contract|n|契約（書）|sign a contract
deadline|n|締め切り|meet the deadline
invoice|n|請求書|send an invoice
survey|n|調査、アンケート|conduct a survey
equipment|n|機器、設備|office equipment
facility|n|施設|a sports facility
location|n|場所、所在地|a convenient location
branch|n|支店|open a new branch
headquarters|n|本社|company headquarters
colleague|n|同僚|a former colleague
supervisor|n|上司、監督者|ask your supervisor
candidate|n|候補者|a job candidate
applicant|n|応募者|qualified applicants
position|n|職、地位、位置|apply for a position
résumé|n|履歴書|submit a résumé
reference|n|参照、推薦状|a letter of reference
workshop|n|研修会、講習会|attend a workshop
conference|n|会議、協議会|an international conference
seminar|n|セミナー|a free seminar
presentation|n|発表、プレゼン|give a presentation
agenda|n|議題（一覧）|the meeting agenda
minutes|n|議事録|take the minutes
proposal|n|提案（書）|submit a proposal
feedback|n|意見、感想|customer feedback
complaint|n|苦情|handle a complaint
refund|n|返金、払い戻し|ask for a refund
warranty|n|保証（書）|under warranty
shipment|n|発送（品）|a shipment of books
inventory|n|在庫（一覧）|check the inventory
supply|n|供給、備品|office supplies
supplier|n|供給業者、仕入れ先|a reliable supplier
merchandise|n|商品|return the merchandise
revenue|n|収益、売上|annual revenue
profit|n|利益|increase profits
expense|n|費用、経費|travel expenses
fee|n|料金、手数料|an entry fee
payment|n|支払い|make a payment
loan|n|融資、ローン|a bank loan
tenant|n|賃借人、テナント|new tenants
property|n|不動産、物件|rental property
lease|n|賃貸借契約|sign a lease
renovation|n|改装|closed for renovation
construction|n|建設、工事|under construction
maintenance|n|保守、整備|routine maintenance
directions|n|道順、指示|give directions
instructions|n|説明書、使用法|follow the instructions
permission|n|許可|ask for permission
policy|n|方針、規定|a refund policy
regulation|n|規則|safety regulations
procedure|n|手順|follow the procedure
requirement|n|必要条件|meet the requirements
opportunity|n|機会|a job opportunity
benefit|n|利益、手当|employee benefits
promotion|n|昇進、販売促進|get a promotion
award|n|賞|win an award
reception|n|受付、歓迎会|the reception desk
appointment|n|（面会の）約束、予約|make an appointment
reservation|n|予約|make a reservation
destination|n|目的地|a travel destination
itinerary|n|旅程表|a travel itinerary
luggage|n|手荷物|carry-on luggage
fare|n|運賃|a bus fare
vehicle|n|乗り物、車両|a delivery vehicle
commute|n|通勤|a long commute
employer|n|雇用主|a large employer
personnel|n|人員、人事部|personnel department
board|n|取締役会、掲示板|the board of directors
director|n|取締役、責任者|the sales director
executive|n|重役、幹部|a senior executive
representative|n|担当者、代表者|a sales representative
accountant|n|会計士|a certified accountant
architect|n|建築家|a famous architect
annual|a|年1回の、年間の|an annual meeting
current|a|現在の|current address
previous|a|以前の|previous experience
upcoming|a|近く行われる|the upcoming event
additional|a|追加の|additional charges
various|a|さまざまな|various products
reasonable|a|妥当な、（値段が）手ごろな|a reasonable price
qualified|a|資格のある、適任の|a qualified candidate
experienced|a|経験豊富な|an experienced engineer
responsible|a|責任がある|be responsible for sales
efficient|a|効率的な|an efficient system
effective|a|効果的な、（法律などが）有効な|an effective method
successful|a|成功した|a successful event
valid|a|有効な|a valid ticket
due|a|（支払・提出の）期限が来て、到着予定で|The report is due Friday.
temporary|a|一時的な|a temporary worker
permanent|a|永久の、正規の|a permanent position
direct|a|直接の、直行の|a direct flight
domestic|a|国内の|domestic flights
overseas|a|海外の|overseas markets
financial|a|財政の、金融の|financial reports
complimentary|a|無料の|complimentary breakfast
spacious|a|広々とした|a spacious office
crowded|a|混雑した|a crowded train
confidential|a|機密の|confidential information
accurate|a|正確な|accurate data
detailed|a|詳細な|a detailed report
immediately|ad|ただちに|immediately after the meeting
currently|ad|現在|currently available
approximately|ad|およそ|approximately 50 people
frequently|ad|頻繁に|frequently asked questions
directly|ad|直接|contact me directly
carefully|ad|注意深く|read carefully
finally|ad|ついに、最後に|finally finished
probably|ad|たぶん|probably late
unfortunately|ad|残念ながら|Unfortunately, it was canceled.
especially|ad|特に|especially in summer
nearly|ad|ほとんど、ほぼ|nearly full
regularly|ad|定期的に|regularly checked
due to|p|〜のために、〜が原因で|due to bad weather
according to|p|〜によると|according to the report
instead of|p|〜の代わりに|instead of Monday
in addition to|p|〜に加えて|in addition to the salary
despite|p|〜にもかかわらず|despite the rain
as soon as|c|〜するとすぐに|as soon as you arrive
whether|c|〜かどうか|whether or not
`;
VOCAB[4] = `
accommodate|v|収容する、（要望に）応える|accommodate 200 guests
acquire|v|取得する、買収する|acquire a company
allocate|v|割り当てる、配分する|allocate funds
anticipate|v|予期する、予想する|anticipate delays
assess|v|評価する|assess the damage
authorize|v|許可する、権限を与える|authorize the payment
collaborate|v|協力する、共同で取り組む|collaborate with partners
comply|v|（規則に）従う|comply with regulations
delegate|v|（権限・仕事を）任せる|delegate tasks
demonstrate|v|実演する、示す|demonstrate a product
dispose|v|処分する（of と共に）|dispose of waste
distribute|v|配布する、流通させる|distribute flyers
enhance|v|高める、向上させる|enhance quality
enroll|v|入学する、登録する|enroll in a course
evaluate|v|評価する|evaluate performance
exceed|v|超える、上回る|exceed expectations
facilitate|v|促進する、容易にする|facilitate communication
forward|v|転送する|forward an e-mail
implement|v|実行する、導入する|implement a plan
inquire|v|問い合わせる|inquire about prices
modify|v|修正する、変更する|modify the design
nominate|v|推薦する、指名する|be nominated for an award
oversee|v|監督する|oversee a project
proceed|v|進む、続行する|proceed to Gate 5
pursue|v|追求する|pursue a career
reimburse|v|払い戻す、（経費を）精算する|reimburse travel expenses
resolve|v|解決する|resolve an issue
retain|v|保持する、引き留める|retain customers
subscribe|v|定期購読する、登録する|subscribe to a magazine
undergo|v|（検査・改修を）受ける|undergo renovation
verify|v|確かめる、検証する|verify the information
accompany|v|同行する、添える|accompany a client
advertise|v|広告する、宣伝する|advertise a job opening
browse|v|閲覧する、見て回る|browse the website
cater|v|料理を提供する|cater an event
convert|v|変換する、改造する|convert a file
donate|v|寄付する|donate money
earn|v|稼ぐ、得る|earn a degree
greet|v|あいさつする、出迎える|greet visitors
merge|v|合併する|merge with a rival
obtain|v|手に入れる、取得する|obtain a permit
outline|v|概要を述べる|outline the plan
qualify|v|資格を得る|qualify for a discount
reschedule|v|予定を変更する|reschedule the appointment
specialize|v|専門にする|specialize in tax law
supervise|v|監督する|supervise the staff
acquisition|n|買収、取得|a corporate acquisition
amenity|n|（ホテルなどの）設備、アメニティ|hotel amenities
attendance|n|出席（者数）|attendance at the event
capacity|n|収容能力、容量|seating capacity
compensation|n|報酬、補償|a compensation package
consumer|n|消費者|consumer demand
contractor|n|請負業者|a building contractor
coverage|n|報道、（保険の）補償範囲|insurance coverage
credentials|n|資格証明、経歴|professional credentials
demand|n|需要|high demand
dimensions|n|寸法|the dimensions of the room
expertise|n|専門知識|technical expertise
initiative|n|新たな取り組み、主導権|a new initiative
installment|n|分割払い（の1回分）|pay in installments
inspection|n|検査、点検|a safety inspection
inquiry|n|問い合わせ|customer inquiries
merger|n|合併|a merger between two firms
objective|n|目標、目的|the main objective
outlet|n|販売店、コンセント|retail outlets
patron|n|常連客、後援者|library patrons
performance|n|業績、公演、性能|sales performance
premises|n|敷地、構内|on the premises
priority|n|優先事項|top priority
productivity|n|生産性|increase productivity
quarter|n|四半期、4分の1|the first quarter
questionnaire|n|アンケート、質問票|fill out a questionnaire
recipient|n|受取人|the recipient of the award
reimbursement|n|払い戻し、精算|request reimbursement
retailer|n|小売業者|an online retailer
shortage|n|不足|a staff shortage
subscription|n|定期購読|a magazine subscription
substitute|n|代わりの人・物|find a substitute
transaction|n|取引|online transactions
venue|n|会場|the venue for the conference
voucher|n|引換券、割引券|a gift voucher
workload|n|仕事量|a heavy workload
landlord|n|家主|the landlord of the building
brochure|n|パンフレット|a travel brochure
fund|n|資金、基金|raise funds
asset|n|資産|company assets
deposit|n|手付金、預金|pay a deposit
eligible|a|資格のある、対象となる|eligible for a discount
mandatory|a|義務的な、必須の|mandatory training
optional|a|任意の、選択できる|optional tours
preliminary|a|予備の、準備の|preliminary results
tentative|a|仮の、暫定の|a tentative schedule
renowned|a|有名な|a renowned chef
outstanding|a|傑出した、未払いの|an outstanding balance
prominent|a|目立つ、著名な|a prominent position
competitive|a|競争力のある、他に負けない|competitive prices
comprehensive|a|包括的な|a comprehensive guide
considerable|a|かなりの|a considerable amount
substantial|a|相当な、かなりの|a substantial increase
durable|a|耐久性のある、丈夫な|durable materials
flexible|a|柔軟な|flexible hours
innovative|a|革新的な|innovative products
reliable|a|信頼できる|a reliable supplier
sufficient|a|十分な|sufficient funds
punctual|a|時間を守る|be punctual
promising|a|有望な|a promising candidate
vacant|a|空いている|a vacant room
defective|a|欠陥のある|a defective product
exclusive|a|独占的な、高級な|an exclusive offer
extensive|a|広範囲の|extensive experience
accordingly|ad|それに応じて|adjust accordingly
consequently|ad|その結果|Consequently, sales fell.
previously|ad|以前に|previously worked
promptly|ad|迅速に、時間どおりに|respond promptly
temporarily|ad|一時的に|temporarily closed
primarily|ad|主に|primarily for students
significantly|ad|大幅に、著しく|increase significantly
shortly|ad|まもなく|shortly after noon
otherwise|ad|さもなければ、それ以外は|Otherwise, call me.
nevertheless|ad|それにもかかわらず|Nevertheless, we continued.
prior to|p|〜より前に|prior to the meeting
regarding|p|〜に関して|regarding your order
throughout|p|〜の間ずっと、〜の至る所に|throughout the year
as long as|c|〜する限り、〜しさえすれば|as long as you need
once|c|いったん〜すると|once you arrive
`;
VOCAB[5] = `
adhere|v|（規則に）従う、固執する|adhere to the guidelines
alleviate|v|和らげる、軽減する|alleviate traffic congestion
amend|v|修正する|amend the contract
ascertain|v|確かめる|ascertain the cause
commence|v|始まる、開始する|Construction will commence in May.
compile|v|（資料を）まとめる、編集する|compile data
consolidate|v|統合する、強化する|consolidate operations
curtail|v|削減する、短縮する|curtail spending
deem|v|〜とみなす|be deemed necessary
designate|v|指定する|a designated area
disclose|v|公開する、明らかにする|disclose information
endorse|v|支持する、推薦する|endorse a product
expedite|v|迅速に処理する|expedite the shipment
fluctuate|v|変動する|Prices fluctuate.
generate|v|生み出す、生む|generate revenue
mitigate|v|軽減する|mitigate risks
procure|v|調達する|procure materials
reconcile|v|一致させる、調和させる|reconcile the accounts
remit|v|送金する|remit payment
resume|v|再開する|resume operations
revise|v|改訂する、修正する|revise the schedule
solicit|v|求める、募る|solicit feedback
stipulate|v|規定する|The contract stipulates the terms.
streamline|v|合理化する|streamline procedures
surpass|v|上回る、しのぐ|surpass last year's sales
terminate|v|終わらせる、解除する|terminate a contract
waive|v|（料金などを）免除する|waive the fee
yield|v|生む、産出する|yield good results
coordinate|v|調整する、取りまとめる|coordinate the schedule
emphasize|v|強調する|emphasize safety
envision|v|思い描く|envision the future
pertain|v|関係する（to と共に）|pertain to the project
refrain|v|控える（from と共に）|refrain from smoking
reiterate|v|繰り返し述べる|reiterate the point
undertake|v|引き受ける、着手する|undertake a project
withstand|v|耐える|withstand heavy use
amendment|n|修正、改正|an amendment to the contract
apprentice|n|見習い|an apprentice chef
audit|n|監査|a financial audit
backlog|n|未処理分、たまった仕事|a backlog of orders
breakthrough|n|飛躍的進歩、突破口|a technological breakthrough
clearance|n|在庫一掃、許可|a clearance sale
commission|n|手数料、委託|a sales commission
commodity|n|商品、産物|commodity prices
consensus|n|合意、総意|reach a consensus
correspondence|n|通信、文書のやりとり|business correspondence
discrepancy|n|食い違い|a discrepancy in the figures
endorsement|n|推薦、支持|a celebrity endorsement
enclosure|n|同封物|see the enclosure
expenditure|n|支出、経費|annual expenditure
incentive|n|奨励策、報奨金|sales incentives
liability|n|法的責任、負債|limited liability
logistics|n|物流|a logistics company
milestone|n|節目、重要な段階|an important milestone
outage|n|停電、（サービスの）停止|a power outage
overhaul|n|全面的な見直し、分解修理|a complete overhaul
precaution|n|予防措置、用心|safety precautions
proximity|n|近いこと、近接|proximity to the station
quota|n|割り当て、ノルマ|a sales quota
remittance|n|送金|a remittance fee
stakeholder|n|利害関係者|all stakeholders
tenure|n|在職期間|during his tenure
turnover|n|離職率、売上高|high staff turnover
workforce|n|全従業員、労働力|reduce the workforce
contingency|n|不測の事態|a contingency plan
deficit|n|赤字、不足|a trade deficit
surplus|n|余剰、黒字|a budget surplus
dividend|n|配当金|pay dividends
fiscal|a|会計の、財政の|the fiscal year
imperative|a|必須の、緊急の|It is imperative that we act now.
lucrative|a|もうかる|a lucrative business
meticulous|a|細心の、きわめて注意深い|meticulous work
obsolete|a|時代遅れの|obsolete equipment
pending|a|未決定の、保留中の|a pending decision
pertinent|a|関連のある、適切な|pertinent information
preferred|a|好ましい、優先の|preferred qualifications
redundant|a|余分な、冗長な|redundant steps
reputable|a|評判のよい|a reputable firm
stringent|a|厳しい、厳格な|stringent regulations
subsequent|a|その後の|subsequent meetings
viable|a|実行可能な、実現可能な|a viable option
versatile|a|多用途の、多才な|a versatile tool
interim|a|暫定の、中間の|an interim report
unanimous|a|満場一致の|a unanimous decision
proficient|a|熟達した|proficient in Spanish
cordial|a|心からの、友好的な|a cordial welcome
diligent|a|勤勉な|a diligent worker
impending|a|差し迫った|the impending deadline
inaugural|a|最初の、就任の|the inaugural issue
adjacent|a|隣接した|adjacent to the hotel
concurrently|ad|同時に|run concurrently
consistently|ad|一貫して、常に|consistently high quality
exclusively|ad|独占的に、もっぱら|available exclusively online
inadvertently|ad|うっかり、不注意で|inadvertently deleted
markedly|ad|著しく|markedly improved
moderately|ad|適度に、ほどほどに|moderately priced
predominantly|ad|主に|predominantly young customers
tentatively|ad|仮に、暫定的に|tentatively scheduled
thoroughly|ad|徹底的に|thoroughly inspected
respectively|ad|それぞれ|5 and 7 percent, respectively
notwithstanding|p|〜にもかかわらず|notwithstanding the delay
in light of|p|〜を考慮して|in light of the results
on behalf of|p|〜を代表して、〜の代わりに|on behalf of the company
in the event that|c|万一〜の場合には|in the event that the flight is canceled
provided that|c|〜という条件で|provided that it is ready
whereas|c|〜である一方|whereas sales rose
`;
VOCAB[6] = `
garner|v|（支持・注目を）集める|garner support
relinquish|v|手放す、譲る|relinquish control
abide|v|（規則に）従う、守る（by と共に）|abide by the rules
adjourn|v|（会議を）休会する、延期する|The meeting was adjourned.
augment|v|増やす、増大させる|augment the budget
circumvent|v|回避する、迂回する|circumvent the rules
corroborate|v|裏付ける|corroborate the findings
delineate|v|詳しく述べる、輪郭を描く|delineate responsibilities
deter|v|思いとどまらせる、阻止する|deter theft
elicit|v|引き出す|elicit a response
encompass|v|包含する、含む|encompass several fields
exacerbate|v|悪化させる|exacerbate the problem
forfeit|v|（権利などを）失う、没収される|forfeit the deposit
hamper|v|妨げる|hamper progress
impede|v|妨げる、遅らせる|impede growth
leverage|v|活用する|leverage technology
mandate|v|義務づける、命じる|mandate safety training
rectify|v|是正する、正す|rectify the error
replenish|v|補充する|replenish stock
scrutinize|v|綿密に調べる|scrutinize the data
supersede|v|取って代わる|supersede the old version
underscore|v|強調する|underscore the need
vacate|v|（部屋などを）明け渡す、立ち退く|vacate the premises
attrition|n|（退職などによる）自然減|reduce staff through attrition
inception|n|始まり、創設|since its inception
discretion|n|裁量、慎重さ|at the manager's discretion
remuneration|n|報酬|remuneration package
ramification|n|（予期しない）影響、結果|legal ramifications
caveat|n|注意書き、但し書き|one important caveat
accolade|n|称賛、栄誉|receive accolades
adherence|n|順守|strict adherence to the rules
benchmark|n|基準、指標|an industry benchmark
bottleneck|n|障害、ボトルネック|a production bottleneck
collateral|n|担保|offer collateral
consortium|n|共同事業体、企業連合|a consortium of banks
deliberation|n|熟考、審議|after careful deliberation
foresight|n|先見の明|business foresight
impetus|n|弾み、勢い|give impetus to growth
incumbent|n|現職者|the incumbent mayor
moratorium|n|一時停止|a moratorium on hiring
oversight|n|見落とし、監督|due to an oversight
patronage|n|ひいき、愛顧|Thank you for your patronage.
prerequisite|n|前提条件|a prerequisite for the course
provision|n|規定、供給|a provision in the contract
rapport|n|信頼関係|build rapport with clients
repercussion|n|（悪い）影響|serious repercussions
stipend|n|手当、奨学金|a monthly stipend
synergy|n|相乗効果|create synergy
tally|n|集計、記録|keep a tally
upheaval|n|大変動、混乱|economic upheaval
windfall|n|思いがけない利益|a windfall profit
conducive|a|（〜に）役立つ、助けとなる|conducive to productivity
inclement|a|（天候が）荒れた|inclement weather
lenient|a|寛大な、甘い|a lenient policy
prudent|a|慎重な、賢明な|a prudent decision
judicious|a|賢明な、思慮深い|judicious use of funds
contingent|a|（〜を）条件とする、次第である|contingent on approval
commensurate|a|相応の、釣り合った|salary commensurate with experience
amenable|a|受け入れる用意がある、従順な|amenable to changes
ample|a|十分な、たっぷりの|ample parking
arbitrary|a|任意の、独断的な|an arbitrary decision
candid|a|率直な|a candid opinion
cohesive|a|まとまりのある|a cohesive team
compelling|a|説得力のある、強く引きつける|a compelling argument
complacent|a|自己満足した|become complacent
discerning|a|目の肥えた、識別力のある|discerning customers
exemplary|a|模範的な|exemplary service
feasible|a|実現可能な|a feasible plan
formidable|a|手ごわい、恐るべき|a formidable competitor
imminent|a|差し迫った|an imminent threat
indispensable|a|不可欠な|an indispensable tool
intermittent|a|断続的な|intermittent rain
lucid|a|明快な|a lucid explanation
negligible|a|ごくわずかな、無視できる|a negligible difference
nominal|a|名ばかりの、わずかな|a nominal fee
pivotal|a|極めて重要な、中心的な|a pivotal role
precarious|a|不安定な、危うい|a precarious situation
scrupulous|a|良心的な、細心の|scrupulous attention to detail
stagnant|a|停滞した|stagnant sales
tangible|a|具体的な、有形の|tangible results
unprecedented|a|前例のない|unprecedented growth
vigilant|a|油断のない、警戒している|remain vigilant
categorically|ad|断固として、きっぱりと|categorically deny
intermittently|ad|断続的に|work intermittently
judiciously|ad|賢明に|use resources judiciously
meticulously|ad|細心の注意を払って|meticulously planned
provisionally|ad|暫定的に、仮に|provisionally approved
succinctly|ad|簡潔に|explain succinctly
unequivocally|ad|明確に、きっぱりと|unequivocally stated
henceforth|ad|今後は|Henceforth, all reports must be signed.
pursuant to|p|〜に従って|pursuant to the agreement
in lieu of|p|〜の代わりに|in lieu of payment
`;
