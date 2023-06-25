from com.dtmilano.android.viewclient import ViewClient
from time import sleep
import pdb

def find_tag(dump, tag):
  for index, item in enumerate(dump):
    if item.__class__.__name__ == tag:
      return item

def find_edit_text(dump):
  return find_tag(dump, 'EditText');

class GoogleAccountViewClient:
  def __init__(self):
    self.vc = ViewClient(*ViewClient.connectToDeviceOrExit())
  def has_view_with_text(self, text):
    self.dump()
    el = self.vc.findViewWithText(text)
    return el and True or False;
    

  def setup(self, username, password, first_name, last_name):
    self.dump()
    pdb.set_trace()
    create_account = self.vc.findViewWithTextOrRaise(u'Create account')
    create_account.touch()
    self.dump();
    self.vc.findViewWithTextOrRaise(u'For myself').touch()
    self.dump()
    firstName = self.vc.findViewByIdOrRaise("firstName");
    firstName.setText(first_name)
    lastName = self.vc.findViewByIdOrRaise("lastName");
    lastName.setText(last_name)
    self.dump()
    self.vc.findViewWithTextOrRaise(u'Next').touch()
    self.dump()
    month = self.vc.findViewByIdOrRaise('month-label')
    month.touch()
    self.dump()
    january = self.vc.findViewWithTextOrRaise(u'January')
    january.touch()
    self.dump()
    self.vc.findViewByIdOrRaise("day").setText("1")
    self.vc.findViewByIdOrRaise("year").setText("1985")
    self.vc.findViewByIdOrRaise("gender-label").touch()
    self.dump()
    self.vc.findViewWithTextOrRaise("Male").touch()
    self.dump()
    self.vc.findViewWithTextOrRaise(u'Next').touch()
    self.dump()
    create = self.vc.findViewWithText("Create your own Gmail address")
    if create:
      create.touch()
    edit_text = find_edit_text(self.dump())
    edit_text.setText(username)
    self.vc.findViewWithTextOrRaise(u'Next').touch()
    find_edit_text(self.dump()).setText(password)
    self.vc.findViewWithTextOrRaise(u'Next').touch()
    self.dump()
  def dump(self):
    try:
      return self.vc.dump()
    except:
      sleep(10000)
      return self.vc.dump()
  def enter_verification_number(self, phone_number):
    self.dump()
    self.vc.findViewByIdOrRaise("phoneNumberId").setText(phone_number + "\n")
    #find_tag(self.dump(), "Button").touch()
    #self.vc.findViewByTagOrRaise("Button").touch()
    #findViewWithTextOrRaise(u'Next').touch()
  def enter_otp(self, otp):
    find_edit_text(self.dump()).setText(otp + "\n")
  def finish_workflow(self):
    self.dump()
    self.vc.findViewWithTextOrRaise(u'Skip').touch()
    self.dump()
    self.vc.findViewWithTextOrRaise(u'Next').touch()
    self.dump()
    self.vc.findViewWithTextOrRaise(u'More options').touch()
    self.dump()
    self.vc.findViewByIdOrRaise("selectionc10").touch()
    self.vc.findViewByIdOrRaise("selectionc12").touch()
    self.vc.findViewByIdOrRaise("selectionc14").touch()
    self.vc.findViewWithTextOrRaise(u'I agree').touch()


if __name__ == "__main__":
  vc = GoogleAccountViewClient()
  vc.setup("fcktheoppsbustback", "asdasdasd111", "Rick", "Jones")
  vc.enter_verification_number("+16232613548")
  vc.enter_otp("042884")
  vc.finish_workflow()
