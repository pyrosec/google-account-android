from com.dtmilano.android.viewclient import ViewClient
from time import sleep
import pdb


def run():
  vc = ViewClient(*ViewClient.connectToDeviceOrExit())
  print(vc.traverse())
if __name__ == "__main__":
  run()

