from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.fonts import addMapping
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Flowable, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "petal-and-plan-user-guide-khmer.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

FONT_PATH = "/System/Library/Fonts/Supplemental/Khmer Sangam MN.ttf"
pdfmetrics.registerFont(TTFont("KhmerSangam", FONT_PATH))
addMapping("KhmerSangam", 0, 0, "KhmerSangam")
addMapping("KhmerSangam", 1, 0, "KhmerSangam")

PAGE_W, PAGE_H = A4
BLUSH = colors.HexColor("#FFF5F7")
ROSE = colors.HexColor("#B96F87")
ROSE_DARK = colors.HexColor("#6A4757")
LAVENDER = colors.HexColor("#EEE6FF")
PURPLE = colors.HexColor("#82649B")
CREAM = colors.HexColor("#FFF9ED")
MINT = colors.HexColor("#EAF8F1")
INK = colors.HexColor("#57434D")
MUTED = colors.HexColor("#8C747F")
LINE = colors.HexColor("#EED8E0")

base = getSampleStyleSheet()
styles = {
    "cover": ParagraphStyle("cover", fontName="KhmerSangam", fontSize=27, leading=39, textColor=ROSE_DARK, alignment=TA_CENTER, spaceAfter=10),
    "cover_sub": ParagraphStyle("cover_sub", fontName="KhmerSangam", fontSize=11, leading=20, textColor=MUTED, alignment=TA_CENTER),
    "title": ParagraphStyle("title", fontName="KhmerSangam", fontSize=21, leading=32, textColor=ROSE_DARK, spaceAfter=7),
    "section": ParagraphStyle("section", fontName="KhmerSangam", fontSize=14, leading=23, textColor=PURPLE, spaceBefore=7, spaceAfter=4),
    "body": ParagraphStyle("body", fontName="KhmerSangam", fontSize=9.6, leading=18, textColor=INK, spaceAfter=5),
    "small": ParagraphStyle("small", fontName="KhmerSangam", fontSize=8, leading=13, textColor=MUTED),
    "card_title": ParagraphStyle("card_title", fontName="KhmerSangam", fontSize=11.2, leading=18, textColor=ROSE_DARK, spaceAfter=3),
    "step": ParagraphStyle("step", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=colors.white, alignment=TA_CENTER),
}


class AccentLine(Flowable):
    def __init__(self, width=52 * mm):
        super().__init__(); self.width = width; self.height = 4
    def draw(self):
        self.canv.setStrokeColor(ROSE); self.canv.setLineWidth(3); self.canv.setLineCap(1); self.canv.line(0, 2, self.width, 2)


def background(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BLUSH); canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(LAVENDER); canvas.circle(PAGE_W - 12 * mm, PAGE_H - 7 * mm, 25 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#FFE3EB")); canvas.circle(8 * mm, 5 * mm, 22 * mm, fill=1, stroke=0)
    canvas.setFillColor(MUTED); canvas.setFont("KhmerSangam", 8)
    canvas.drawString(18 * mm, 10 * mm, "PETAL & PLAN  /  សៀវភៅណែនាំ")
    canvas.drawRightString(PAGE_W - 18 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()


doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=18*mm, title="Petal & Plan - សៀវភៅណែនាំ", author="Petal & Plan")
frame = Frame(doc.leftMargin, doc.bottomMargin + 4*mm, doc.width, doc.height - 8*mm, id="main")
doc.addPageTemplates([PageTemplate(id="guide", frames=[frame], onPage=background)])


def p(text, style="body"):
    return Paragraph(text, styles[style])


def card(title, body, tint=colors.white, width=80*mm):
    t = Table([[p(title, "card_title")], [p(body)]], colWidths=[width])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),tint),("BOX",(0,0),(-1,-1),0.8,LINE),("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    return t


def step(number, title, body):
    badge = Table([[Paragraph(str(number), styles["step"])]], colWidths=[9*mm], rowHeights=[9*mm])
    badge.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),ROSE),("VALIGN",(0,0),(-1,-1),"MIDDLE")]))
    row = Table([[badge, [p(title,"card_title"), p(body)]]], colWidths=[13*mm,145*mm])
    row.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),4),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]))
    return row


story = []

# 1 - Cover
story += [Spacer(1,32*mm), p("ផ្ទាំងគ្រប់គ្រងប្រចាំថ្ងៃផ្ទាល់ខ្លួន", "cover_sub"), Spacer(1,12*mm), p("Petal & Plan", "cover"), p("មគ្គុទ្ទេសក៍ងាយៗសម្រាប់រៀបចំថ្ងៃរបស់អ្នក បង្កើតទម្លាប់ កត់ត្រាគំនិត និងកំណត់ផ្ទាំងគ្រប់គ្រងឱ្យស្របតាមចំណូលចិត្ត។", "cover_sub"), Spacer(1,9*mm), AccentLine(55*mm), Spacer(1,23*mm)]
cover_cards = Table([[card("១. បើកផ្ទាំងគ្រប់គ្រង", "ចូលទៅកាន់ <b>/dashboard</b>។ កាលបរិច្ឆេទ សារស្វាគមន៍ វឌ្ឍនភាព និងឧបករណ៍ប្រចាំថ្ងៃរបស់អ្នកនឹងបង្ហាញរួមគ្នា។", colors.white,74*mm), card("២. រៀបចំផែនការប្រចាំថ្ងៃ", "បន្ថែមកិច្ចការ ជ្រើសប្រភេទ និងកម្រិតអាទិភាព រួចគូសសម្គាល់ពេលបានបញ្ចប់។", colors.white,74*mm)]], colWidths=[82*mm,82*mm])
cover_cards.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4)]))
story += [cover_cards, Spacer(1,8*mm), p("ផ្ទាំងនេះត្រូវបានរចនាឡើងសម្រាប់មនុស្សម្នាក់នៅលើឧបករណ៍មួយ ហើយមិនតម្រូវឱ្យមានគណនីទេ។", "cover_sub"), PageBreak()]

# 2 - Tour
story += [p("ស្គាល់ផ្ទាំងគ្រប់គ្រងរបស់អ្នក", "title"), AccentLine(), Spacer(1,5*mm), p("ផ្ទាំងគ្រប់គ្រងប្រមូលអ្វីៗដែលអ្នកត្រូវការប្រចាំថ្ងៃនៅកន្លែងតែមួយ។ នៅលើអេក្រង់ធំ កិច្ចការនៅខាងឆ្វេង ហើយឧបករណ៍ផ្សេងៗនៅខាងស្តាំ។ នៅលើទូរស័ព្ទ កាតទាំងអស់នឹងរៀបបន្តគ្នាចុះក្រោម។")]
tour = Table([
    [card("ផ្នែកក្បាល", "បង្ហាញកាលបរិច្ឆេទ ឈ្មោះ សារស្វាគមន៍ ភាគរយកិច្ចការបានបញ្ចប់ រូបប្រវត្តិរូប និងប៊ូតុង Settings។", CREAM,75*mm), card("កម្មវិធីគ្រប់គ្រងកិច្ចការ", "បង្កើត ត្រង បញ្ចប់ បើកឡើងវិញ និងលុបកិច្ចការសម្រាប់ថ្ងៃនេះ។", colors.white,75*mm)],
    [card("ខគម្ពីរប្រចាំថ្ងៃ", "ទាញយកខគម្ពីរភាសាអង់គ្លេសពី World English Bible ហើយរក្សាខដដែលពេញមួយថ្ងៃ។", LAVENDER,75*mm), card("សួនទម្លាប់", "បង្កើតទម្លាប់ប្រចាំ និងចុចពិនិត្យពេលបានធ្វើ។ រូបភ្លើងបង្ហាញចំនួន streak ដែលបានរក្សាទុក។", MINT,75*mm)],
    [card("កំណត់ត្រារហ័ស", "កន្លែងសម្រាប់គំនិត និងការរំលឹក។ អត្ថបទនៅដដែលរហូតដល់អ្នកកែ ឬលុប ហើយចុចរក្សាទុកម្ដងទៀត។", colors.HexColor("#FFF0F4"),75*mm), card("ការកំណត់", "កែឈ្មោះ រូបប្រវត្តិរូប សារស្វាគមន៍ ម៉ោងតំបន់ និងការបង្ហាញកិច្ចការដែលបានបញ្ចប់។", colors.white,75*mm)],
], colWidths=[82*mm,82*mm], rowHeights=[45*mm]*3)
tour.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]))
story += [tour, Spacer(1,5*mm), card("គួរដឹង", "ទិន្នន័យត្រូវបានរក្សាទុកនៅលើឧបករណ៍បច្ចុប្បន្ន។ ប្រសិនបើអ្នកបើកនៅក្នុងកម្មវិធីរុករកផ្សេង ឬលុបទិន្នន័យកម្មវិធីរុករក ទិន្នន័យចាស់នឹងមិនបង្ហាញដោយស្វ័យប្រវត្តិទេ។", CREAM,164*mm), PageBreak()]

# 3 - Tasks
story += [p("រៀបចំ និងបញ្ចប់កិច្ចការប្រចាំថ្ងៃ", "title"), AccentLine(), Spacer(1,5*mm), p("ប្រើកាតកិច្ចការធំសម្រាប់អ្វីៗដែលអ្នកចង់បញ្ចប់នៅថ្ងៃនេះ។")]
story += [
    step(1,"សរសេរកិច្ចការ","វាយសកម្មភាពច្បាស់លាស់ក្នុងប្រអប់កិច្ចការថ្មី ដូចជា <i>ឆ្លើយអ៊ីមែលអតិថិជន</i> ឬ <i>ទិញផ្កា</i>។"),
    step(2,"ជ្រើសប្រភេទ","ជ្រើស Work, Personal, Creative ឬ Shopping ដើម្បីងាយត្រងបញ្ជីនៅពេលក្រោយ។"),
    step(3,"កំណត់អាទិភាព","ប្រើ Cute & Quick សម្រាប់ការងារតូចៗ Big Focus សម្រាប់ការងារត្រូវការផ្ដោត និង Deadline សម្រាប់ការងារមានពេលកំណត់។"),
    step(4,"បន្ថែមកិច្ចការ","ចុច Add។ កិច្ចការនឹងបង្ហាញក្នុងបញ្ជីថ្ងៃនេះ ហើយចំនួនវឌ្ឍនភាពនឹងកែប្រែដោយស្វ័យប្រវត្តិ។"),
    step(5,"បញ្ចប់ ឬលុប","ចុចប្រអប់ធីកដើម្បីបញ្ចប់កិច្ចការ។ ចុចម្ដងទៀតដើម្បីបើកឡើងវិញ ឬចុចធុងសំរាមដើម្បីលុប។"),
    p("ត្រងបញ្ជី", "section"), p("ជ្រើស All sprinkles ដើម្បីមើលគ្រប់កិច្ចការ ឬជ្រើសប៊ូតុងប្រភេទណាមួយដើម្បីមើលតែកិច្ចការប្រភេទនោះ។"),
]
priority = Table([[card("Cute & Quick","ការងារតូច និងរហ័ស",colors.HexColor("#FFF0F4"),48*mm),card("Big Focus","ការងារត្រូវការផ្ដោត",LAVENDER,48*mm),card("Deadline","ការងារមានពេលកំណត់",CREAM,48*mm)]], colWidths=[54*mm]*3)
priority.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),3),("RIGHTPADDING",(0,0),(-1,-1),3)]))
story += [priority, Spacer(1,5*mm), card("ការកំណត់ឡើងវិញប្រចាំថ្ងៃ", "កិច្ចការត្រូវបានភ្ជាប់នឹងថ្ងៃដែលបានបង្កើត។ ពេលថ្ងៃថ្មីចាប់ផ្ដើមតាមម៉ោងតំបន់ដែលអ្នកបានជ្រើស កិច្ចការចាស់ទាំងអស់នឹងត្រូវលុបដោយស្វ័យប្រវត្តិ រួមទាំងកិច្ចការមិនទាន់បញ្ចប់។", colors.HexColor("#FFF0F4"),164*mm), PageBreak()]

# 4 - Tools
story += [p("ទម្លាប់ កំណត់ត្រា និងខគម្ពីរប្រចាំថ្ងៃ", "title"), AccentLine(), Spacer(1,5*mm), p("សួនទម្លាប់", "section")]
story += [step(1,"បន្ថែមទម្លាប់","វាយទម្លាប់ខ្លីៗ ដូចជា <i>ផឹកទឹក</i> <i>អធិស្ឋាន</i> ឬ <i>អាន ១០ នាទី</i> ហើយចុចប៊ូតុងបូក។"), step(2,"ចុចពិនិត្យ","ចុចប៊ូតុងការ៉េនៅក្បែរទម្លាប់។ ចំនួន streak នឹងកើនមួយ ហើយទម្លាប់នោះនឹងបង្ហាញថាបានបញ្ចប់។"), step(3,"មិនធ្វើវិញ ឬលុប","ចុចប៊ូតុងដែលបានធីកម្ដងទៀតដើម្បីត្រឡប់ក្រោយ ឬប្រើរូបធុងសំរាមដើម្បីលុបទម្លាប់ជាអចិន្ត្រៃយ៍។")]
story += [p("កំណត់ត្រារហ័ស", "section"), p("សរសេរ ឬកែអត្ថបទក្នុងប្រអប់កំណត់ត្រា ហើយចុច <b>Save my notes</b>។ រង់ចាំសារបញ្ជាក់ថាបានរក្សាទុកមុនចាកចេញ។ ដើម្បីសម្អាត សូមលុបអត្ថបទទាំងអស់ ហើយចុចរក្សាទុកម្ដងទៀត។"), p("ខគម្ពីរប្រចាំថ្ងៃ", "section"), p("កាតខគម្ពីរទាញយកខគម្ពីរភាសាអង់គ្លេសពិតប្រាកដពី Bible API ប្រភពបើកចំហ ដោយប្រើ World English Bible។ ពេលបានទាញយក ខនោះនឹងរក្សាទុកក្នុងកម្មវិធីរុករក និងនៅដដែលពេញមួយថ្ងៃ។ ថ្ងៃបន្ទាប់ ប្រព័ន្ធនឹងជ្រើសខថ្មីដោយស្វ័យប្រវត្តិ។"), p("ចុច <b>Another verse</b> ប្រសិនបើអ្នកចង់បានខផ្សេង។ ខថ្មីនោះនឹងត្រូវរក្សាទុកសម្រាប់ថ្ងៃនោះ។ ប្រសិនបើសេវាមិនដំណើរការ សូមពិនិត្យអ៊ីនធឺណិត ហើយចុច Try again។"), Spacer(1,4*mm), card("ចំណាំអំពីឯកជនភាព", "សំណើខគម្ពីរត្រូវបានផ្ញើទៅ bible-api.com ប៉ុណ្ណោះ។ កិច្ចការ ទម្លាប់ កំណត់ត្រា និងព័ត៌មានប្រវត្តិរូបរបស់អ្នកមិនត្រូវបានផ្ញើជាមួយទេ។", LAVENDER,164*mm), PageBreak()]

# 5 - Settings
story += [p("កែផ្ទាំងឱ្យស្របតាមចំណូលចិត្ត", "title"), AccentLine(), Spacer(1,5*mm), p("បើក Settings ពីប៊ូតុងនៅក្បែររូបប្រវត្តិរូប។ កែអ្វីដែលអ្នកចង់បាន ហើយចុច <b>Save my settings</b>។")]
rows = [
    ("ឈ្មោះបង្ហាញ","ប្រើក្នុងសារស្វាគមន៍នៅលើផ្ទាំងគ្រប់គ្រង។"),
    ("រូបប្រវត្តិរូប","ជ្រើស JPG, PNG, WebP ឬ GIF។ អ្នកនឹងឃើញរូបសាកល្បងមុនរក្សាទុក ហើយរូបធំនឹងត្រូវបង្រួមដោយស្វ័យប្រវត្តិ។"),
    ("សារប្រចាំថ្ងៃ","ប្រយោគលើកទឹកចិត្តដែលបង្ហាញក្រោមឈ្មោះរបស់អ្នក។"),
    ("ម៉ោងតំបន់","គ្រប់គ្រងកាលបរិច្ឆេទ និងពេលដែលកិច្ចការចាស់ត្រូវបានលុប។"),
    ("បង្ហាញកិច្ចការបានបញ្ចប់","រក្សាកិច្ចការដែលបានបញ្ចប់ឱ្យនៅមើលឃើញក្នុងបញ្ជីថ្ងៃនេះ។"),
]
t = Table([[p(f"<b>{a}</b>"),p(b)] for a,b in rows], colWidths=[48*mm,116*mm])
t.setStyle(TableStyle([("BACKGROUND",(0,0),(0,-1),LAVENDER),("BACKGROUND",(1,0),(1,-1),colors.white),("GRID",(0,0),(-1,-1),0.6,LINE),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6)]))
story += [t, Spacer(1,6*mm), p("របៀបដាក់រូបប្រវត្តិរូប", "section"), step(1,"ជ្រើសរូបថត","ចុចផ្ទាំងរូបប្រវត្តិរូប ហើយជ្រើសរូបភាពដែលគាំទ្រពីឧបករណ៍របស់អ្នក។"), step(2,"ពិនិត្យរូបសាកល្បង","ពិនិត្យមើលថារូបក្នុងស៊ុមមូលមើលទៅល្អ។ អ្នកអាចជ្រើសម្ដងទៀតបើចង់ប្ដូរ។"), step(3,"រក្សាទុក","ចុច Save my settings។ រូបថ្មីនឹងបង្ហាញនៅផ្នែកក្បាលនៃផ្ទាំងគ្រប់គ្រងក្រោយរក្សាទុករួច។"), Spacer(1,4*mm), card("ដោះស្រាយបញ្ហា", "បើរក្សាទុកមិនបាន សូមពិនិត្យថាឯកសារជារូបភាពដែលគាំទ្រ។ កុំ refresh មុនឃើញសារបញ្ជាក់ថាបានរក្សាទុក។ បើខគម្ពីរមិនបង្ហាញ សូមពិនិត្យអ៊ីនធឺណិត ហើយចុច Try again។ បើទិន្នន័យបាត់ សូមពិនិត្យថាអ្នកបានលុបទិន្នន័យកម្មវិធីរុករក ឬបានប្ដូរឧបករណ៍ឬអត់។", CREAM,164*mm), Spacer(1,5*mm), p("អ្នករួចរាល់ហើយ។ រក្សាផ្ទាំងឱ្យសាមញ្ញ ទាន់ពេល និងមានភាពទន់ភ្លន់ចំពោះខ្លួនឯង។", "cover_sub")]

doc.build(story)
print(OUTPUT)
