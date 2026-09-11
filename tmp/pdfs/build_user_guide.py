from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, KeepTogether, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "petal-and-plan-user-guide.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

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

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", fontName="Helvetica-Bold", fontSize=29, leading=34, textColor=ROSE_DARK, alignment=TA_CENTER, spaceAfter=12))
styles.add(ParagraphStyle(name="CoverSub", fontName="Helvetica", fontSize=12, leading=18, textColor=MUTED, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="PageTitle", fontName="Helvetica-Bold", fontSize=22, leading=27, textColor=ROSE_DARK, spaceAfter=8))
styles.add(ParagraphStyle(name="Section", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=PURPLE, spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle(name="Body2", fontName="Helvetica", fontSize=10.2, leading=15, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle(name="Small", fontName="Helvetica", fontSize=8.5, leading=12, textColor=MUTED))
styles.add(ParagraphStyle(name="CardTitle", fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=ROSE_DARK, spaceAfter=4))
styles.add(ParagraphStyle(name="StepNo", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=colors.white, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="Tip", fontName="Helvetica-Bold", fontSize=9.5, leading=14, textColor=PURPLE))


class AccentLine(Flowable):
    def __init__(self, width=52 * mm):
        super().__init__()
        self.width = width
        self.height = 4

    def draw(self):
        self.canv.setStrokeColor(ROSE)
        self.canv.setLineWidth(3)
        self.canv.setLineCap(1)
        self.canv.line(0, 2, self.width, 2)


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BLUSH)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(LAVENDER)
    canvas.circle(PAGE_W - 12 * mm, PAGE_H - 7 * mm, 25 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#FFE3EB"))
    canvas.circle(8 * mm, 5 * mm, 22 * mm, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(18 * mm, 10 * mm, "PETAL & PLAN  /  USER GUIDE")
    canvas.drawRightString(PAGE_W - 18 * mm, 10 * mm, f"{doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
    topMargin=18 * mm, bottomMargin=18 * mm, title="Petal & Plan User Guide",
    author="Petal & Plan",
)
frame = Frame(doc.leftMargin, doc.bottomMargin + 4 * mm, doc.width, doc.height - 8 * mm, id="main")
doc.addPageTemplates([PageTemplate(id="guide", frames=[frame], onPage=header_footer)])


def pill(text, bg=LAVENDER, fg=PURPLE):
    t = Table([[Paragraph(text, ParagraphStyle("pill", parent=styles["Small"], fontName="Helvetica-Bold", textColor=fg, alignment=TA_CENTER))]], colWidths=[38 * mm])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), bg), ("BOX", (0, 0), (-1, -1), 0.5, colors.white), ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    return t


def card(title, body, tint=colors.white, width=80 * mm):
    content = [[Paragraph(title, styles["CardTitle"])], [Paragraph(body, styles["Body2"])]]
    t = Table(content, colWidths=[width])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), tint), ("BOX", (0, 0), (-1, -1), 0.8, LINE), ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
    return t


def step(number, title, body):
    badge = Table([[Paragraph(str(number), styles["StepNo"])]], colWidths=[9 * mm], rowHeights=[9 * mm])
    badge.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), ROSE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
    detail = [Paragraph(title, styles["CardTitle"]), Paragraph(body, styles["Body2"])]
    row = Table([[badge, detail]], colWidths=[13 * mm, 145 * mm])
    row.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    return row


story = []

# Cover
story += [Spacer(1, 34 * mm), pill("PERSONAL DAILY DASHBOARD", CREAM, ROSE), Spacer(1, 13 * mm), Paragraph("Petal & Plan", styles["CoverTitle"]), Paragraph("A simple guide to planning your day, growing habits, saving thoughts, and personalizing your space.", styles["CoverSub"]), Spacer(1, 9 * mm), AccentLine(55 * mm), Spacer(1, 24 * mm)]
quick = Table([[card("1. Open your dashboard", "Go to <b>/dashboard</b>. Your date, greeting, progress, and daily tools appear together.", colors.white, 74 * mm), card("2. Plan the day", "Add tasks, choose a category and priority, then check items off as you finish.", colors.white, 74 * mm)]], colWidths=[82 * mm, 82 * mm])
quick.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4)]))
story += [quick, Spacer(1, 8 * mm), Paragraph("The dashboard is designed for one person on one device. No account is required.", styles["CoverSub"]), PageBreak()]

# Tour
story += [Paragraph("Your dashboard at a glance", styles["PageTitle"]), AccentLine(), Spacer(1, 6 * mm), Paragraph("The dashboard brings the parts of your day into one calm view. On a wide screen, tasks sit on the left and supporting tools sit in the sidebar. On a phone, the cards stack vertically.", styles["Body2"]), Spacer(1, 4 * mm)]
tour_data = [
    [card("Header", "Shows today's date, your display name, greeting message, completion percentage, profile picture, and the Settings button.", CREAM, 75 * mm), card("Task manager", "Create, filter, complete, reopen, and delete today's tasks.", colors.white, 75 * mm)],
    [card("Daily Bible verse", "Loads an English verse from the World English Bible. The same verse is kept for the day.", LAVENDER, 75 * mm), card("Habit garden", "Create recurring habits and check them in. The flame count shows the current stored streak.", MINT, 75 * mm)],
    [card("Quick notes", "A scratchpad for ideas and reminders. Notes remain until you replace or clear them and save again.", colors.HexColor("#FFF0F4"), 75 * mm), card("Settings", "Personalize your profile, greeting, timezone, and completed-task visibility.", colors.white, 75 * mm)],
]
tour = Table(tour_data, colWidths=[82 * mm, 82 * mm], rowHeights=[44 * mm] * 3)
tour.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4), ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
story += [tour, Spacer(1, 6 * mm), card("Good to know", "Changes are saved on the current device. If you open the hosted dashboard in another browser or clear browser storage, that browser will not automatically have the same information.", CREAM, 164 * mm), PageBreak()]

# Tasks
story += [Paragraph("Plan and complete daily tasks", styles["PageTitle"]), AccentLine(), Spacer(1, 5 * mm), Paragraph("Use the main task card for everything you want to finish today.", styles["Body2"])]
story += [step(1, "Write the task", "Type a clear action into the new-task field, such as <i>Reply to client email</i> or <i>Buy flowers</i>."), step(2, "Choose a category", "Select Work, Personal, Creative, or Shopping. Categories make the filter buttons useful later."), step(3, "Set the priority", "Use Cute & Quick for small wins, Big Focus for deep work, or Deadline for time-sensitive items."), step(4, "Add it", "Press Add. The task appears in today's list and the progress count updates automatically."), step(5, "Finish or remove it", "Select the checkbox to complete a task. Select it again to reopen the task. Use the trash button to delete it permanently.")]
story += [Spacer(1, 4 * mm), Paragraph("Filter the list", styles["Section"]), Paragraph("Choose All sprinkles to see every task, or select a category chip to focus on just that kind of work.", styles["Body2"])]
priority = Table([[pill("Cute & Quick", colors.HexColor("#FFF0F4"), ROSE), pill("Big Focus", LAVENDER, PURPLE), pill("Deadline", CREAM, colors.HexColor("#9D7441"))]], colWidths=[54 * mm] * 3)
priority.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER")]))
story += [priority, Spacer(1, 6 * mm), card("Daily reset", "Tasks belong to the day they were created. When a new day begins in your selected timezone, older tasks are automatically removed. This includes unfinished tasks, so move anything important into today's list before the date changes.", colors.HexColor("#FFF0F4"), 164 * mm), PageBreak()]

# Tools
story += [Paragraph("Habits, notes, and daily Scripture", styles["PageTitle"]), AccentLine(), Spacer(1, 6 * mm)]
story += [Paragraph("Habit garden", styles["Section"]), step(1, "Add a habit", "Enter a short ritual such as <i>Drink water</i>, <i>Pray</i>, or <i>Read for 10 minutes</i>, then press the plus button."), step(2, "Check in", "Press the square check-in button beside a habit. Its stored streak increases by one and the habit receives a completed style."), step(3, "Undo or delete", "Press the completed button again to undo that check-in. Use the trash icon to permanently remove the habit.")]
story += [Paragraph("Quick notes", styles["Section"]), Paragraph("Write or edit anything in the scratchpad, then press <b>Save my notes</b>. Wait for the saved confirmation before leaving the page. To clear the scratchpad, delete its text and save again.", styles["Body2"])]
story += [Paragraph("Daily Bible verse", styles["Section"]), Paragraph("The verse card requests a real English verse from the open-source Bible API using the World English Bible. Once loaded, the verse is stored in your browser and remains the same for that calendar day. A fresh verse is chosen automatically on the next day.", styles["Body2"]), Paragraph("Press <b>Another verse</b> if you want a different one. Your replacement becomes the saved verse for the rest of that day. If the service is unavailable, use Try again after checking your internet connection.", styles["Body2"]), Spacer(1, 5 * mm), card("Privacy note", "The verse request goes to bible-api.com. Dashboard tasks, habits, notes, and profile settings are not sent with that request.", LAVENDER, 164 * mm), PageBreak()]

# Settings
story += [Paragraph("Personalize your space", styles["PageTitle"]), AccentLine(), Spacer(1, 5 * mm), Paragraph("Open Settings from the button beside your profile picture. Make all the changes you want, then press <b>Save my settings</b>.", styles["Body2"])]
settings_rows = [
    ["Display name", "Used in the dashboard greeting."],
    ["Profile picture", "Choose JPG, PNG, WebP, or GIF. A preview appears before saving. Large images are optimized automatically."],
    ["Daily message", "The inspirational sentence shown underneath your name."],
    ["Timezone", "Controls the current date and when old daily tasks are removed."],
    ["Show completed tasks", "Keeps completed items visible in today's task list when enabled."],
]
settings_table = Table([[Paragraph(f"<b>{a}</b>", styles["Body2"]), Paragraph(b, styles["Body2"])] for a, b in settings_rows], colWidths=[45 * mm, 119 * mm])
settings_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, -1), LAVENDER), ("BACKGROUND", (1, 0), (1, -1), colors.white), ("GRID", (0, 0), (-1, -1), 0.6, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
story += [settings_table, Spacer(1, 7 * mm), Paragraph("Profile-picture workflow", styles["Section"]), step(1, "Choose a photo", "Select the profile-picture panel and choose a supported image from your device."), step(2, "Review the preview", "Confirm the crop looks good inside the rounded preview. Choose again if you want a different image."), step(3, "Save", "Press Save my settings. The picture appears in the dashboard header after the save completes.")]
story += [Spacer(1, 5 * mm), card("Troubleshooting", "If a save fails, confirm the selected file is an image in a supported format. Refresh only after a saved confirmation. For a missing daily verse, confirm the device is online and press Try again. If hosted data disappears, check whether browser storage was cleared or whether you switched browsers/devices.", CREAM, 164 * mm), Spacer(1, 7 * mm), Paragraph("You are ready. Keep the dashboard small, current, and kind to yourself.", ParagraphStyle("closing", parent=styles["CoverSub"], fontName="Helvetica-Bold", textColor=ROSE_DARK))]

doc.build(story)
print(OUTPUT)
