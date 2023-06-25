from com.dtmilano.android.viewclient import ViewClient
from time import sleep
from com.dtmilano.android.adb.adbclient import AdbClient
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
    try:
      self.vc.findViewWithTextOrRaise(text)
      return True
    except:
      return False
    
  def goto_add_google(self, pin="000000"):
    adbclient = AdbClient()
    device = adbclient.getDevices()[0]
    adbclient.setSerialno(device.serialno)
    adbclient.shell("am start -a android.settings.ADD_ACCOUNT_SETTINGS -n com.android.settings/.accounts.AddAccountSettings")
    self.dump()
    google_field = self.vc.findViewWithText("Google")
    if google_field:
      google_field.touch()
      self.vc.sleep(5)
      edit_field = find_edit_text(self.dump())
      if edit_field:
        edit_field.setText(pin + "\n")
        self.vc.sleep(5)



  def setup(self, username, password, first_name, last_name):
    self.dump()
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
      sleep(5)
      return self.dump();
  def enter_verification_number(self, phone_number):
    self.dump()
    self.vc.findViewByIdOrRaise("phoneNumberId").setText(phone_number + "\n")
    #find_tag(self.dump(), "Button").touch()
    #self.vc.findViewByTagOrRaise("Button").touch()
    #findViewWithTextOrRaise(u'Next').touch()
  def enter_otp(self, otp):
    self.vc.sleep(5)
    find_edit_text(self.dump()).setText(otp + "\n")
  def finish_workflow(self):
    self.vc.device.dragDip((289.0, 485.0), (46.0, 0.0), 1000, 20, 0)
    self.vc.sleep(5)
    self.dump()
    self.vc.findViewWithTextOrRaise(u'Skip').touch()
    self.dump()
    self.vc.findViewWithTextOrRaise(u'Next').touch()
    self.dump()
    self.vc.device.dragDip((289.0, 485.0), (46.0, 0.0), 1000, 20, 0)
    #self.vc.findViewWithTextOrRaise(u'More options').touch()
    self.dump()
    self.vc.device.dragDip((289.0, 485.0), (46.0, 0.0), 1000, 20, 0)
    self.dump()
    self.vc.device.dragDip((289.0, 485.0), (46.0, 0.0), 1000, 20, 0)
    self.dump()
    self.vc.device.dragDip((289.0, 485.0), (46.0, 0.0), 1000, 20, 0)
    self.dump()
    self.vc.device.dragDip((289.0, 485.0), (46.0, 0.0), 1000, 20, 0)
    self.dump()
    #self.vc.findViewByIdOrRaise("selectionc10").touch()
    #self.vc.findViewByIdOrRaise("selectionc12").touch()
    #self.vc.findViewByIdOrRaise("selectionc14").touch()
    self.vc.findViewWithTextOrRaise(u'I agree').touch()
    self.dump()
    self.vc.findViewWithTextOrRaise("Confirm").touch()
    


if __name__ == "__main__":
  vc = GoogleAccountViewClient()
  #vc.goto_add_google("000000")
  #vc.setup("fcktheoppsbustback", "asdasdasd111", "Rick", "Jones")
  #vc.enter_verification_number("+16232613548")
  vc.enter_otp("340481")
  vc.finish_workflow()
