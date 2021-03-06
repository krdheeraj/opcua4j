/*  Test 5.10.5 Error Test 6 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script calls republish using a sequenceNumber that had been previously
        acknowledged in a publish call.

    Revision History:
        22-Sep-2009 AT: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function republish5105Err006()
{
    var i;

    // create subscription    
    var subscription = new Subscription();
    createSubscription( subscription, g_session );

    // create monitored items
    var monitoredItems = [];
    var clientHandle = 0;
    monitoredItems[0] = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name );
    monitoredItems[1] = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("udi").name );

    if( monitoredItems[0] === null || monitoredItems[1] === null )
    {
        addSkipped( "Static Scalar - 2 Nodes needed" );
        return;
    }

    if( !createMonitoredItems( monitoredItems, TimestampsToReturn.Both, subscription, g_session ) )
    {
        return;
    }

    wait( subscription.RevisedPublishingInterval );

    // call publish to get the first sequence number
    if( !publishService.Execute() )
    {
        deleteSubscription( subscription );
        return;
    }
    
    // call Publish() to acknowledge the first sequence
    publishService.Execute();

    // call republish with the sequence number received above
    var republishRequest = new UaRepublishRequest();
    var republishResponse = new UaRepublishResponse();
    g_session.buildRequestHeader( republishRequest.RequestHeader );
    
    republishRequest.RetransmitSequenceNumber = publishService.AcknowledgedSequenceNumbers.pop(); // last one acknowledged
    republishRequest.SubscriptionId = subscription.SubscriptionId;

    uaStatus = g_session.republish( republishRequest, republishResponse );
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadMessageNotAvailable );
        checkRepublishFailed( republishRequest, republishResponse, expectedServiceResult );
    }
    else
    {
        addError( "RePublish() status " + uaStatus, uaStatus );
    }

    // clean-up
    deleteMonitoredItems( monitoredItems, subscription, g_session );
    deleteSubscription( subscription, g_session );
    publishService.Clear();
}

safelyInvoke( republish5105Err006 );